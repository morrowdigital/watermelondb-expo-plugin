-- this function is calle by WatermelonDB when it wants to pull any changes
-- server side. The server should check when was the 'last_pulled_at' and return
-- the changed rows since then (created, updated, deleted);
create or replace function pull(p_record_owner character varying default NULL, last_pulled_at bigint default 0) returns jsonb as $$
declare _ts timestamp with time zone;
_games jsonb;
begin -- timestamp
_ts := to_timestamp(last_pulled_at / 1000);
--- games
select jsonb_build_object(
        -- No created rows.
        -- Server returns the created rows as updated.
        -- WatermelonDB on client side needs to have
        -- sendCreatedAsUpdated flag set to true
        -- so it does not complain.
        'created',
        '[]'::jsonb,
        -- here we build the 'updated' object to return to WatermelonDB
        'updated',
        coalesce(
            jsonb_agg(
                jsonb_build_object(
                    'id',
                    t.id,
                    'title',
                    t.title,
                    'min_players',
                    t.min_players,
                    'created_at',
                    timestamp_to_epoch(t.created_at),
                    'updated_at',
                    timestamp_to_epoch(t.updated_at)
                )
            ) filter (
                -- the row is not deleted and was modified after the last pull
                where t.deleted_at is null
                    and t.last_modified_at > _ts
                    and t.record_owner = p_record_owner
            ),
            '[]'::jsonb
        ),
        -- if we have a deleted_at stamp, then it is a deleted row
        -- and we need to return its id to client side
        -- if it was updated after the last pull
        -- Also on first pull where timestamp is 0, we'll serve all the contents
        'deleted',
        coalesce(
            jsonb_agg(to_jsonb(t.id)) filter (
                where t.deleted_at is not null
                    and t.last_modified_at > _ts
                    and t.record_owner = p_record_owner
            ),
            '[]'::jsonb
        )
    ) into _games
from board_games t;
-- build the final object that is expected by WatermelonDB
return jsonb_build_object(
    'changes',
    jsonb_build_object(
        'board_games', -- this is the table name
        _games
    ),
    'timestamp',
    timestamp_to_epoch(now())
);
end;
$$ language plpgsql;
