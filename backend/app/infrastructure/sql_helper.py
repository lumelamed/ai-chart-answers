import re

def is_safe_sql(sql: str) -> bool:
    sql_lower = sql.lower()
    forbidden = ["drop ", "delete ", "update ", "insert ", "alter ", "create ", "replace "]
    return not any(f in sql_lower for f in forbidden)

def clean_sql_output(raw_output: str) -> str:
    return re.sub(r"```(?:sql)?\s*([\s\S]+?)```", r"\1", raw_output).strip()

