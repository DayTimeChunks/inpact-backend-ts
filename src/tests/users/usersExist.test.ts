import { PostgresService } from "../../services/PostgresService";
import { BaseConfiguration } from "../../conf/BaseConfiguration";

describe("Checking that users have been inserted", () => {
  const postgresService = new PostgresService(BaseConfiguration.getTestRdsValues())
  test('nothing yet', () => {
    console.log(postgresService)
    expect(1).toBe(1);
  })
})