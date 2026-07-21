import os
migration_file = "backend/alembic/versions/fc4ab3e2c198_add_workspace_and_enterprise_security_.py"
with open(migration_file, "r") as f:
    content = f.read()

# Replace nullable=False with nullable=True for all added columns except workspaces and workspace_members
tables_to_patch = ['audit_logs', 'conversations', 'document_intelligence', 'documents', 'knowledge_edges', 'messages', 'search_logs']
for table in tables_to_patch:
    content = content.replace(
        f"op.add_column('{table}', sa.Column('workspace_id', sa.String(length=36), nullable=False))",
        f"op.add_column('{table}', sa.Column('workspace_id', sa.String(length=36), nullable=True))"
    )

content = content.replace(
    "op.add_column('audit_logs', sa.Column('status', sa.String(length=50), nullable=False))",
    "op.add_column('audit_logs', sa.Column('status', sa.String(length=50), nullable=True))"
)
content = content.replace(
    "op.add_column('audit_logs', sa.Column('severity', sa.String(length=50), nullable=False))",
    "op.add_column('audit_logs', sa.Column('severity', sa.String(length=50), nullable=True))"
)

content = content.replace(
    "    op.alter_column('knowledge_nodes', 'workspace_id',\n               existing_type=sa.VARCHAR(length=36),\n               nullable=False)",
    "" 
)


data_migration = """
    # --- DATA MIGRATION ---
    bind = op.get_bind()
    import uuid, datetime
    default_workspace_id = str(uuid.uuid4())
    now = datetime.datetime.now(datetime.timezone.utc)
    
    # 1. Create Default Workspace
    bind.execute(sa.text(
        "INSERT INTO workspaces (id, name, is_active, created_at, updated_at) "
        "VALUES (:id, 'Default Workspace', true, :now, :now)"
    ), {"id": default_workspace_id, "now": now})
    
    # 2. Assign all existing users to Default Workspace
    bind.execute(sa.text(
        "INSERT INTO workspace_members (id, workspace_id, user_id, role, is_active, created_at, updated_at) "
        "SELECT gen_random_uuid()::varchar(36), :wid, id, 'admin', true, :now, :now FROM users"
    ), {"wid": default_workspace_id, "now": now})

    # 3. Backfill workspace_id for all tables
    for table in ['audit_logs', 'conversations', 'document_intelligence', 'documents', 'knowledge_edges', 'knowledge_nodes', 'messages', 'search_logs']:
        bind.execute(sa.text(f"UPDATE {table} SET workspace_id = :wid"), {"wid": default_workspace_id})
        op.alter_column(table, 'workspace_id', existing_type=sa.String(length=36), nullable=False)
        
    # 4. Backfill status and severity for audit_logs
    bind.execute(sa.text("UPDATE audit_logs SET status = 'SUCCESS', severity = 'INFO'"))
    op.alter_column('audit_logs', 'status', existing_type=sa.String(length=50), nullable=False)
    op.alter_column('audit_logs', 'severity', existing_type=sa.String(length=50), nullable=False)

    # ### end Alembic commands ###
"""

content = content.replace("    # ### end Alembic commands ###\n\n\ndef downgrade", data_migration + "\n\ndef downgrade")

with open(migration_file, "w") as f:
    f.write(content)
