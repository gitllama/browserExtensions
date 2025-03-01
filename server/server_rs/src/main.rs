mod root;
mod process;

use axum::{ routing::{get, post}, Router, };
use serde::{Deserialize, Serialize};
use tracing::info;
use tracing_subscriber;
use tracing_subscriber::EnvFilter;
use std::sync::Arc;
use tokio::sync::Mutex;


#[derive(Clone, Deserialize, Serialize)]
struct Status {
  busy: bool,
}


#[tokio::main]
async fn main() {
  tracing_subscriber::fmt()
    .with_env_filter(EnvFilter::new("info"))
    .init();
  info!("Hello, axum logging!");

  let state = Status { busy : false };
  let users_state = Arc::new(Mutex::new(state));

  let app = Router::new()
    .route("/", get(root::root))
    .route("/api", post(process::call_process))
    .with_state(Arc::clone(&users_state));

  let listener = tokio::net::TcpListener::bind("127.0.0.1:8000").await.unwrap();
  axum::serve(listener, app).await.unwrap();
}





