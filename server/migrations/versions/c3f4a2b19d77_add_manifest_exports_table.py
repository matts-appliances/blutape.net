"""add manifest exports table

Revision ID: c3f4a2b19d77
Revises: 1821ee44309e
Create Date: 2026-03-10 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "c3f4a2b19d77"
down_revision = "1821ee44309e"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "manifest_exports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("machine_id", sa.Integer(), nullable=False),
        sa.Column("work_order_id", sa.Integer(), nullable=False),
        sa.Column("work_order_event_id", sa.Integer(), nullable=False),
        sa.Column("export_target", sa.String(length=50), nullable=False),
        sa.Column("export_source_date", sa.Date(), nullable=False),
        sa.Column("exported_manifest_id", sa.String(length=150), nullable=True),
        sa.Column("exported_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["machine_id"], ["machines.id"]),
        sa.ForeignKeyConstraint(["work_order_event_id"], ["work_order_events.id"]),
        sa.ForeignKeyConstraint(["work_order_id"], ["work_orders.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "work_order_event_id",
            "export_target",
            name="uq_manifest_exports_event_target",
        ),
    )
    with op.batch_alter_table("manifest_exports", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_manifest_exports_machine_id"), ["machine_id"], unique=False)
        batch_op.create_index(batch_op.f("ix_manifest_exports_work_order_id"), ["work_order_id"], unique=False)
        batch_op.create_index(batch_op.f("ix_manifest_exports_work_order_event_id"), ["work_order_event_id"], unique=False)
        batch_op.create_index(batch_op.f("ix_manifest_exports_export_target"), ["export_target"], unique=False)
        batch_op.create_index(batch_op.f("ix_manifest_exports_export_source_date"), ["export_source_date"], unique=False)
        batch_op.create_index(batch_op.f("ix_manifest_exports_exported_manifest_id"), ["exported_manifest_id"], unique=False)


def downgrade():
    with op.batch_alter_table("manifest_exports", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_manifest_exports_exported_manifest_id"))
        batch_op.drop_index(batch_op.f("ix_manifest_exports_export_source_date"))
        batch_op.drop_index(batch_op.f("ix_manifest_exports_export_target"))
        batch_op.drop_index(batch_op.f("ix_manifest_exports_work_order_event_id"))
        batch_op.drop_index(batch_op.f("ix_manifest_exports_work_order_id"))
        batch_op.drop_index(batch_op.f("ix_manifest_exports_machine_id"))

    op.drop_table("manifest_exports")
