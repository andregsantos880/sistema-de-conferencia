using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SisConf.Infrastructure.Persistencia.Migrations
{
    /// <inheritdoc />
    public partial class Conferencia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "pedido",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    arquivo_importacao_id = table.Column<Guid>(type: "uuid", nullable: true),
                    layout_id = table.Column<Guid>(type: "uuid", nullable: false),
                    box_id = table.Column<Guid>(type: "uuid", nullable: true),
                    grupo_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status_id = table.Column<Guid>(type: "uuid", nullable: false),
                    etiqueta = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ordem_compra = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    cliente = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    pe_cliente = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    produto = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    descricao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    qtde = table.Column<int>(type: "integer", nullable: true),
                    volume = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    sequencia = table.Column<long>(type: "bigint", nullable: true),
                    lock_session_id = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    lock_expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    lock_usuario_id = table.Column<Guid>(type: "uuid", nullable: true),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    atualizado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_pedido", x => x.id);
                    table.ForeignKey(
                        name: "fk_pedido_box_box_id",
                        column: x => x.box_id,
                        principalTable: "box",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_pedido_grupo_grupo_id",
                        column: x => x.grupo_id,
                        principalTable: "grupo",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_pedido_layout_layout_id",
                        column: x => x.layout_id,
                        principalTable: "layout",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_pedido_status_status_id",
                        column: x => x.status_id,
                        principalTable: "status",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_pedido_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_pedido_usuario_lock_usuario_id",
                        column: x => x.lock_usuario_id,
                        principalTable: "usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "pedido_evento",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    pedido_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status_anterior_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status_novo_id = table.Column<Guid>(type: "uuid", nullable: false),
                    usuario_id = table.Column<Guid>(type: "uuid", nullable: false),
                    client_event_id = table.Column<Guid>(type: "uuid", nullable: false),
                    ocorreu_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    origem = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    metadata_json = table.Column<string>(type: "jsonb", nullable: true),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    atualizado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_pedido_evento", x => x.id);
                    table.ForeignKey(
                        name: "fk_pedido_evento_pedido_pedido_id",
                        column: x => x.pedido_id,
                        principalTable: "pedido",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_pedido_evento_status_status_novo_id",
                        column: x => x.status_novo_id,
                        principalTable: "status",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_pedido_evento_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_pedido_evento_usuario_usuario_id",
                        column: x => x.usuario_id,
                        principalTable: "usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_pedido_box_id",
                table: "pedido",
                column: "box_id");

            migrationBuilder.CreateIndex(
                name: "ix_pedido_grupo_id",
                table: "pedido",
                column: "grupo_id");

            migrationBuilder.CreateIndex(
                name: "ix_pedido_layout_id",
                table: "pedido",
                column: "layout_id");

            migrationBuilder.CreateIndex(
                name: "ix_pedido_lock_usuario_id",
                table: "pedido",
                column: "lock_usuario_id");

            migrationBuilder.CreateIndex(
                name: "ix_pedido_status_id",
                table: "pedido",
                column: "status_id");

            migrationBuilder.CreateIndex(
                name: "ix_pedido_tenant_id_arquivo_importacao_id",
                table: "pedido",
                columns: new[] { "tenant_id", "arquivo_importacao_id" });

            migrationBuilder.CreateIndex(
                name: "ix_pedido_tenant_id_etiqueta",
                table: "pedido",
                columns: new[] { "tenant_id", "etiqueta" });

            migrationBuilder.CreateIndex(
                name: "ix_pedido_tenant_id_grupo_id",
                table: "pedido",
                columns: new[] { "tenant_id", "grupo_id" });

            migrationBuilder.CreateIndex(
                name: "ix_pedido_tenant_id_status_id_box_id",
                table: "pedido",
                columns: new[] { "tenant_id", "status_id", "box_id" });

            migrationBuilder.CreateIndex(
                name: "ix_pedido_evento_client_event_id",
                table: "pedido_evento",
                column: "client_event_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_pedido_evento_pedido_id",
                table: "pedido_evento",
                column: "pedido_id");

            migrationBuilder.CreateIndex(
                name: "ix_pedido_evento_status_novo_id",
                table: "pedido_evento",
                column: "status_novo_id");

            migrationBuilder.CreateIndex(
                name: "ix_pedido_evento_tenant_id_ocorreu_em",
                table: "pedido_evento",
                columns: new[] { "tenant_id", "ocorreu_em" });

            migrationBuilder.CreateIndex(
                name: "ix_pedido_evento_tenant_id_pedido_id_ocorreu_em",
                table: "pedido_evento",
                columns: new[] { "tenant_id", "pedido_id", "ocorreu_em" });

            migrationBuilder.CreateIndex(
                name: "ix_pedido_evento_tenant_id_usuario_id_ocorreu_em",
                table: "pedido_evento",
                columns: new[] { "tenant_id", "usuario_id", "ocorreu_em" });

            migrationBuilder.CreateIndex(
                name: "ix_pedido_evento_usuario_id",
                table: "pedido_evento",
                column: "usuario_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "pedido_evento");

            migrationBuilder.DropTable(
                name: "pedido");
        }
    }
}
