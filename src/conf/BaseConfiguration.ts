import * as nconf from 'nconf';

nconf.argv().env();

export interface RdsConfig {
  host: string,
  port: number,
  database?: string,
  user: string,
  password: string,
  max: number
}

export class BaseConfiguration {
  public readonly isDevelopment: boolean;
  public readonly InpactRdsConfig: RdsConfig;

  constructor() {
    this.isDevelopment = this.getIsDevelopment();
    this.InpactRdsConfig = this.getDefautlRdsValues();
  }

  protected getValue(name: string): string {
    nconf.required([name])
    return nconf.get(name)
  }

  private getIsDevelopment(): boolean {
    return this.getValue('NODE_ENV') == 'development';
  }

  private getDefautlRdsValues(): RdsConfig {
    return {
      host: this.getValue('RDS_HOSTNAME'),
      database: this.getValue('RDS_DB_NAME'),
      port: parseInt(this.getValue('RDS_PORT')),
      user: this.getValue('RDS_USERNAME'),
      password: this.getValue('RDS_PASSWORD'),
      max: 100 // This is the max size pooled connections per node instance
    };
  }
  public static getTestRdsValues(): RdsConfig {
    return {
      host: 'localhost',
      port: 5432,
      database: 'inpact_test',
      user: 'inpact_test_user',
      password: 'inpact4ever',
      max: 100 // This is the max size pooled connections per node instance
    };
  }

}