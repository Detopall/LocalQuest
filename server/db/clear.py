import sqlite3

def clear_all_data(db_name):
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Get a list of all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    # Delete all data from each table
    for table in tables:
        cursor.execute(f"DELETE FROM {table[0]}")

    conn.commit()
    conn.close()
    print("All data has been deleted from the database.")
