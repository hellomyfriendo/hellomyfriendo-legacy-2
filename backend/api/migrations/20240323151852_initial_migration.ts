import type {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis');

  await knex.schema.createTable('places', table => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('google_place_id').notNullable().unique();
    table.string('formatted_address').notNullable();
    table.double('latitude').notNullable();
    table.double('longitude').notNullable();
    table.timestamps({defaultToNow: true});
  });

  await knex.schema.createTable('wants', table => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('creator_id').notNullable();
    table.string('title').notNullable();
    table.text('description');
    table
      .enum('visibility', ['friends', 'public', 'specific'], {
        useNative: true,
        enumName: 'want_visibility',
      })
      .notNullable();
    table
      .uuid('place_id')
      .references('id')
      .inTable('places')
      .onDelete('SET NULL'),
      table.integer('radius_in_meters');
    table.timestamps({defaultToNow: true});
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('wants');
  await knex.schema.raw('DROP TYPE want_visibility');
  await knex.schema.dropTableIfExists('places');
  await knex.schema.raw('DROP EXTENSION postgis CASCADE');
}
