import { PoolClient } from 'pg'

export async function m001_InpactDBcreation(client: PoolClient) {

  // Setup function to run on trigger
  await client.query(`
    CREATE OR REPLACE FUNCTION trigger_set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
    $$ LANGUAGE plpgsql;
  `);

  // user table
  // In knex project, avatar was stored as: avatar bytea DEFAULT '\x6e2f61',
  await client.query(`
    CREATE TABLE public.users (
      id SERIAL PRIMARY KEY,
      email varchar(42) UNIQUE,
      name varchar(42) NOT NULL,
      last_name varchar(42) NOT NULL,
      username varchar(42) NOT NULL,
      password text NOT NULL,
      is_admin boolean NOT NULL DEFAULT false,
      address text DEFAULT NULL,
      country text DEFAULT NULL,
      avatar bytea,
      about_me text DEFAULT NULL,
      education text DEFAULT NULL,
      experiences text DEFAULT NULL,
      interests text DEFAULT NULL,
      inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Setup updated_at trigger for users table
  await client.query(`
    CREATE TRIGGER public_users_set_updated_at
      BEFORE UPDATE ON public.users
      FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_updated_at();
  `);

}