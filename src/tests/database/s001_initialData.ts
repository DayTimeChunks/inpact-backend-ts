import * as SQL from "sql-template";
import { PostgresService } from "../../services/PostgresService";
import { getUsersSampleData } from "./sampleData";

export async function s001_initialData(inpactTestDB: PostgresService) {
  await Promise.all([
    seedUsers(inpactTestDB),
  ]);
}

const seedUsers = async (inpactTestDB: PostgresService) => {
  const users = getUsersSampleData();
  await Promise.all(users.map((user: any) => {
    return inpactTestDB.query(SQL`
      INSERT INTO public.users
        $keys${Object.keys(user)}
        $values${user}
    `);
  }));
}

export const deleteAllUsers =  async (inpactTestDB: PostgresService) => {
  return inpactTestDB.query(SQL`
      DELETE FROM public.users
    `);
}

