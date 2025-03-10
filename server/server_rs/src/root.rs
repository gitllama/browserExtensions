use crate::Status;
use axum::{
  Json,
  extract::State,
};
use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn root() -> &'static str {
  "Hello, World!"
}

pub async fn get(State(users_state): State<Arc<Mutex<Status>>>) -> Json<Status> {
  let users_lock = users_state.lock().await;
  Json(users_lock.clone())
}