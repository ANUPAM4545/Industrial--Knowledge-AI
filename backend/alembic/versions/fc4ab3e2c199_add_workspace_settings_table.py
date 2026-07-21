"""add workspace settings table

Revision ID: fc4ab3e2c199
Revises: fc4ab3e2c198
Create Date: 2026-07-17 13:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'fc4ab3e2c199'
down_revision: Union[str, None] = 'fc4ab3e2c198'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create the new workspace_settings table
    op.create_table('workspace_settings',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workspace_id', sa.String(length=36), nullable=False),
        sa.Column('document_policy', sa.String(length=50), nullable=False, server_default='standard'),
        sa.Column('allowed_mime_types', sa.JSON(), nullable=False, server_default='["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/csv"]'),
        sa.Column('max_upload_size_mb', sa.Integer(), nullable=False, server_default='50'),
        sa.Column('ai_provider', sa.String(length=50), nullable=False, server_default='gemini'),
        sa.Column('ai_model', sa.String(length=50), nullable=False, server_default='gemini-2.5-flash'),
        sa.Column('knowledge_only_mode', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('citation_requirements', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('security_level', sa.String(length=50), nullable=False, server_default='standard'),
        sa.Column('retention_policy_days', sa.Integer(), nullable=False, server_default='365'),
        sa.Column('developer_mode', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deleted_by', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workspace_settings_id'), 'workspace_settings', ['id'], unique=False)
    op.create_index(op.f('ix_workspace_settings_workspace_id'), 'workspace_settings', ['workspace_id'], unique=True)
    op.create_index(op.f('ix_workspace_settings_deleted_at'), 'workspace_settings', ['deleted_at'], unique=False)

    # 2. Populate default settings for existing workspaces
    # NOTE: Since `uuid_generate_v4` might not be available, we will just use python generation
    import uuid
    # actually, we can just let postgres generate gen_random_uuid() which is available in pg13+
    op.execute("""
        INSERT INTO workspace_settings (
            id, workspace_id, created_at, updated_at
        )
        SELECT 
            gen_random_uuid()::text, 
            id, 
            CURRENT_TIMESTAMP, 
            CURRENT_TIMESTAMP
        FROM workspaces
    """)

    # 3. Drop existing columns from workspaces
    op.drop_column('workspaces', 'document_policy')
    op.drop_column('workspaces', 'ai_policy')


def downgrade() -> None:
    # 1. Add back the JSON columns
    op.add_column('workspaces', sa.Column('ai_policy', postgresql.JSON(astext_type=sa.Text()), autoincrement=False, nullable=True))
    op.add_column('workspaces', sa.Column('document_policy', postgresql.JSON(astext_type=sa.Text()), autoincrement=False, nullable=True))
    
    # 2. Drop the settings table
    op.drop_index(op.f('ix_workspace_settings_deleted_at'), table_name='workspace_settings')
    op.drop_index(op.f('ix_workspace_settings_workspace_id'), table_name='workspace_settings')
    op.drop_index(op.f('ix_workspace_settings_id'), table_name='workspace_settings')
    op.drop_table('workspace_settings')
