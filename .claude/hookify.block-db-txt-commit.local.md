---
name: block-db-txt-commit
enabled: true
event: bash
pattern: git\s+add.*db\.txt
action: block
---

⛔ **阻止提交 db.txt**

`db.txt` 是 Claude 操作 Supabase 的日志文件，用于记录数据库变更以便回滚和审查，属于本地辅助文件，不得提交到 git 仓库。
请从 `git add` 命令中移除 `db.txt`，只提交其他文件。
