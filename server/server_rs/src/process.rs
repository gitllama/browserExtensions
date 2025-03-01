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
use tokio_util::codec::{FramedRead, BytesCodec};
use futures_util::StreamExt;
use encoding_rs::{SHIFT_JIS, CoderResult};
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


fn _process(program : String, args : Vec<String>) -> std::io::Result<()> {
  let mut child = std::process::Command::new(program)
  .args(args)
  .spawn().unwrap();
  let _ = child.wait();
  Ok(())
}

fn _process2(program : String, args : Vec<String>) -> std::io::Result<()> {
  use std::io::Read;

  let mut child = std::process::Command::new(program)
    .args(args)
    .spawn()
    .expect("failed to execute process");
  let stdout = child.stdout.take().expect("failed to capture stdout");
  let stdout_reader = std::io::BufReader::new(stdout);


  let stdout_thread = std::thread::spawn(move || {
    let mut buffer = Vec::new();
    for byte in stdout_reader.bytes() {
      match byte {
        Ok(byte) => {
          buffer.push(byte);
          if byte == b'\n' || byte == b'\r' {
            let (res, _en, had_errors) = SHIFT_JIS.decode(&buffer);
            if !had_errors {
              print!("{}", res);
            }
            buffer.clear();
          }
        }
        Err(e) => {
          eprintln!("Error reading byte from stdout: {}", e);
          break;
        }
      }
    }
});

  stdout_thread.join().expect("stdout thread panicked");
  Ok(())
}

async fn process(program : String, args : Vec<String>) -> std::io::Result<()> {
  let mut child = tokio::process::Command::new(program)
    .args(args)
    .spawn()?;
  child.wait().await?;
  Ok(())
}


async fn _process_with_output(program : String, args : Vec<String>) -> std::io::Result<String> {
  let output = tokio::process::Command::new(program)
    .args(args)
    .output()
    .await
    .expect("failed to execute sleep");
    info!("output {}", String::from_utf8_lossy(&output.stdout));
  Ok(String::from_utf8_lossy(&output.stdout).to_string())
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
  let status = child.wait().await?;

  // stdout_thread.join().expect("stdout thread panicked");

  Ok("output.clone()".to_string())
}

/*
 // let stdout_thread = std::thread::spawn(move || {
  //   let mut reader = stdout_reader.bytes(); // バイト単位のイテレータ
  //   let mut output_buffer = [0u8; 4];
  //   let mut index = 0;
  //   while let Some(byte_result) = reader.next() {
  //     match byte_result {
  //       Ok(byte) => {
  //         output_buffer[index] = byte;
  //         index = index + 1;
  //         if index > 3 { index = 0; }
  //         let (res, en, had_errors) = SHIFT_JIS.decode(&output_buffer);
  //         // println!("{:?} : {:?} {:?} {}", &buffer, res, &en, had_errors);
  //         if !had_errors {
  //             // println!("{:?} {:?}", output_buffer, res);
  //             // println!("{} : {:?}", res, res);
  //             print!("{}", res);
  //             output_buffer.fill(0);
  //             index = 0;
  //         }
  //       }
  //       Err(e) => {
  //         eprintln!("Error reading byte: {}", e);
  //         break;
  //       }
  //     }
  //   }
  // });
*/