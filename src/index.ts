// config should be included first thing
import 'dotenv/config';

export async function main() {
  console.time('Full report')

  console.timeEnd('Full report')
}

main();