create or replace function create_game(
  game_id uuid,
  game_title character varying,
  game_min_players integer,
  game_record_owner character varying,
  game_created_at timestamp with time zone,
  game_updated_at timestamp with time zone
) returns uuid as $$
declare
  new_id uuid;
begin
  insert into board_games (
    id,
    title,
    min_players,
    record_owner,
    created_at,
    updated_at,
    server_created_at,
    last_modified_at
  )
  values
    (
      game_id,
      game_title,
      game_min_players,
      game_record_owner,
      game_created_at,
      game_updated_at,
      -- automatically handle server side tracking
      -- so we know separately when the server created and last modified the record
      now(),
      now() + interval '1 microsecond'
    ) returning id into new_id;
  return new_id;
end;
$$ language plpgsql;
