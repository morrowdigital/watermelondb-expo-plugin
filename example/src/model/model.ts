import { Model } from '@nozbe/watermelondb';
import { date, field, readonly, text } from '@nozbe/watermelondb/decorators';

export class BoardGame extends Model {
  static table = 'board_games';

  // We add createdAt and updatedAt fields to the model
  // and they will be automatically managed by WatermelonDB
  // @ts-ignore
  @readonly @date('created_at') createdAt!: Date;
  // @ts-ignore
  @readonly @date('updated_at') updatedAt!: Date;
  // we'll use this on server side. Client side watermelonDB has its own mechanism for handling deletions
  // @ts-ignore
  @date('deleted_at') deletedAt;
  // @ts-ignore
  @text('title') title: string;
  // @ts-ignore
  @field('min_players') minPlayers;
}
