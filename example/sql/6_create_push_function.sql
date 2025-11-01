-- This function will receive a JSON from WatermelonDB client-side
-- and will have to handle the creation, update and deletion of rows
-- on the server side. Once succeeded it must return the timestamp.
create or replace function push(changes jsonb, p_record_owner character varying) returns void as $$
declare new_game jsonb;
declare updated_game jsonb;
begin -- insert new games
for new_game in
select jsonb_array_elements((changes->'board_games'->'created')) loop perform create_game(
        (new_game->>'id')::uuid,
        (new_game->>'title'),
        (new_game->>'min_players')::integer,
        p_record_owner,
        -- also replicate the client side tracking stamps
        epoch_to_timestamp(new_game->>'created_at'),
        epoch_to_timestamp(new_game->>'updated_at')
    );
end loop;
-- delete games
with changes_data as (
    -- client side WatermelonDB will only send the ids of the deleted rows
    select jsonb_array_elements_text(changes->'board_games'->'deleted')::uuid as deleted
)
update board_games
-- we don't actually delete the row, we just mark it as deleted
set deleted_at = now(),
    last_modified_at = now()
from changes_data
where board_games.id = changes_data.deleted;
-- update games
for updated_game in
select jsonb_array_elements((changes->'board_games'->'updated')) loop perform update_game(
        (updated_game->>'id')::uuid,
        (updated_game->>'title'),
        (updated_game->>'min_players')::integer,
        p_record_owner,
        -- we update the client side tracking stamps
        epoch_to_timestamp(updated_game->>'updated_at')
    );
end loop;
end;
$$ language plpgsql;
