import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'board_games',
      columns: [
        { name: 'title', type: 'string', isIndexed: true },
        { name: 'min_players', type: 'number' },
        { name: 'created_at', type: 'number' }, // sync field
        { name: 'updated_at', type: 'number' }, // sync field
        { name: 'deleted_at', type: 'number', isOptional: true }, // sync field
      ],
    }),
  ],
});
