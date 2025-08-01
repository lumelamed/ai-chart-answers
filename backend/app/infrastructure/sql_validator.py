def is_safe_sql(sql: str) -> bool:
    sql_lower = sql.lower()
    forbidden = ["drop ", "delete ", "update ", "insert ", "alter ", "create ", "replace "]
    return not any(f in sql_lower for f in forbidden)
