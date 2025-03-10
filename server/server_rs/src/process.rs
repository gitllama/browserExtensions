use crate::Status;
use serde::{Deserialize, Serialize};
use axum::{
  http::StatusCode,
  Json,
  extract::State,
};
use tracing::info;
use std::sync::Arc;
use tokio::sync::{Mutex, oneshot};
use std::process::Stdio;
use encoding_rs::SHIFT_JIS;
use tokio::io::AsyncReadExt;

#[derive(Deserialize, Debug, Default)]
pub struct ReqData {
  program: String,
  args: Vec<String>,
  #[serde(default = "default_program")]
  output : bool
}
fn default_program() -> bool { false }

#[derive(Serialize, Debug)]
pub struct ResData {
  is_busy : bool,
  data : Option<String>
}

pub async fn call_process(State(users_state): State<Arc<Mutex<Status>>>, Json(payload): Json<ReqData>) -> (StatusCode, Json<ResData>) {
  let mut users_lock = users_state.lock().await;
  
  if users_lock.busy {
    let res = ResData {
      is_busy : true,
      data : None
    };
    return (StatusCode::CONFLICT, Json(res));
  }
  users_lock.busy = true;

  info!("call_process, {:?}", payload);
  if payload.output {

    let res = process_with_output(payload.program, payload.args).await;
    let user = ResData {
      is_busy : false,
      data : res.ok()
    };
    info!("call_process finished");
    (StatusCode::CREATED, Json(user))

  } else {

    let (tx, rx) = oneshot::channel::<()>();
    tokio::spawn(async {
      let res = process(payload.program, payload.args).await;
      // let a = process_with_output().await;
      info!("result : {:?}", res);
      let _ = tx.send(());
    });
  
    let users_state_clone = users_state.clone();
    tokio::spawn(async move {
      let _ = rx.await;
      let mut users_lock = users_state_clone.lock().await;
      users_lock.busy = false; // Mark the process as finished
      info!("call_process finished");
    });
  
    let user = ResData {
      is_busy : false,
      data : None
    };
    (StatusCode::CREATED, Json(user))

  }
}

async fn process(program : String, args : Vec<String>) -> std::io::Result<()> {
  let mut child = tokio::process::Command::new(program)
    .args(args)
    .spawn()?;
  child.wait().await?;
  Ok(())
}

async fn process_with_output(program : String, args : Vec<String>) -> std::io::Result<String> {
  let mut child = tokio::process::Command::new(program)
    .args(args)
    .stdout(Stdio::piped())
    .spawn()
    .expect("failed to execute sleep");

  let mut stdout = child.stdout.take().unwrap();
  let mut buffer = Vec::new();
  let mut output = String::new();
  let mut byte_buf = [0u8; 1];

  while stdout.read_exact(&mut byte_buf).await.is_ok() {
    let byte = byte_buf[0];
    buffer.push(byte);
    if byte == b'\n' || byte == b'\r' {
      let (decoded, _, had_errors) = SHIFT_JIS.decode(&buffer);
      if !had_errors {
        info!("{}", decoded);
        output.push_str(&decoded);
        output.push('\n');
      }
      buffer.clear();
    }
  }
  let _status = child.wait().await?;

  Ok("output.clone()".to_string())
}