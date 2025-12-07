import app from './app';
import config from './config';
import createTables from './config/init_db';

async function main() {
    try {
        await createTables();
        app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`);
        });
    } catch (err) {
        console.log(err);
    }
}

main();
