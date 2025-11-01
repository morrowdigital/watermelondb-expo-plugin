create table board_games (
  id uuid not null default gen_random_uuid(),
  primary key (id),
  -- created_at and updated_at are used to track the time of the last change
  -- on the client side by WatermelonDB
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  -- we use the deleted_at column to track the time of deletion on the server
  -- on client side, WatermelonDB has its own way of handling deletions
  deleted_at timestamp with time zone default null,
  -- server_created_at and last_modified_at are used to track the time of the last change
  -- on the server side
  server_created_at timestamp with time zone not null default now(),
  last_modified_at timestamp with time zone not null default now(),

  title character varying not null,
  min_players integer not null default 1,
  record_owner character varying not null
);
