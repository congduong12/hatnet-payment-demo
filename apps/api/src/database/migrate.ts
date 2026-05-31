import dataSource from './data-source.js';

type MigrationDirection = 'up' | 'down';

async function main(direction: MigrationDirection): Promise<void> {
  await dataSource.initialize();

  try {
    if (direction === 'down') {
      await dataSource.undoLastMigration();
      console.log('Reverted last database migration.');
      return;
    }

    const migrations = await dataSource.runMigrations();
    if (migrations.length === 0) {
      console.log('No pending database migrations.');
      return;
    }

    console.log(`Ran ${migrations.length} database migration(s):`);
    for (const migration of migrations) {
      console.log(`- ${migration.name}`);
    }
  } finally {
    await dataSource.destroy();
  }
}

const direction = process.argv[2] === 'down' ? 'down' : 'up';

main(direction).catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
