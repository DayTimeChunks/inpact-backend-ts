import { PostgresService } from "../services/PostgresService";
import { BaseConfiguration } from "../conf";
import { m001_InpactDBcreation } from "../postgresql/migrations";
import { s001_initialData } from "./database/s001_initialData";


export default async () => {
  const inpactTestDB = new PostgresService(BaseConfiguration.getTestRdsValues());

  await performMigrations(inpactTestDB);
  await seedTestDB(inpactTestDB);
  return;
};

const performMigrations = async (inpactTestDB: PostgresService) => {
  const inpactClient = await inpactTestDB.getClient();
  await m001_InpactDBcreation(inpactClient);
}

const seedTestDB = async (inpactTestDB: PostgresService) => {
  await s001_initialData(inpactTestDB);
}
