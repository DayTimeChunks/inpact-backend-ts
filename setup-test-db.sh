psql -c "DROP DATABASE IF EXISTS inpact_test;"
psql -c "DROP USER IF EXISTS inpact_test_user;"

psql -c "CREATE DATABASE inpact_test;"

psql -c "CREATE USER inpact_test_user WITH ENCRYPTED PASSWORD 'inpact4ever';";
psql -c "GRANT ALL PRIVILEGES ON DATABASE inpact_test TO inpact_test_user;";
