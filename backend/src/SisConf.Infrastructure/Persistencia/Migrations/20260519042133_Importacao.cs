using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SisConf.Infrastructure.Persistencia.Migrations
{
    /// <inheritdoc />
    public partial class Importacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "plano_id",
                table: "tenant",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "arquivo_importacao",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    layout_id = table.Column<Guid>(type: "uuid", nullable: false),
                    usuario_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome_arquivo = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    storage_key = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    storage_tamanho_bytes = table.Column<long>(type: "bigint", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    total_linhas = table.Column<int>(type: "integer", nullable: true),
                    linhas_ok = table.Column<int>(type: "integer", nullable: false),
                    linhas_erro = table.Column<int>(type: "integer", nullable: false),
                    iniciado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    finalizado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    mensagem_erro = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    atualizado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_arquivo_importacao", x => x.id);
                    table.ForeignKey(
                        name: "fk_arquivo_importacao_layout_layout_id",
                        column: x => x.layout_id,
                        principalTable: "layout",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_arquivo_importacao_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_arquivo_importacao_usuario_usuario_id",
                        column: x => x.usuario_id,
                        principalTable: "usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "uso_mensal",
                columns: table => new
                {
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    ano_mes = table.Column<int>(type: "integer", nullable: false),
                    importacoes_count = table.Column<int>(type: "integer", nullable: false),
                    pedidos_processados_count = table.Column<int>(type: "integer", nullable: false),
                    atualizado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_uso_mensal", x => new { x.tenant_id, x.ano_mes });
                    table.ForeignKey(
                        name: "fk_uso_mensal_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "arquivo_importacao_erro",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    arquivo_importacao_id = table.Column<Guid>(type: "uuid", nullable: false),
                    numero_linha = table.Column<int>(type: "integer", nullable: false),
                    conteudo = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    mensagem = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    atualizado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_arquivo_importacao_erro", x => x.id);
                    table.ForeignKey(
                        name: "fk_arquivo_importacao_erro_arquivo_importacao_arquivo_importac~",
                        column: x => x.arquivo_importacao_id,
                        principalTable: "arquivo_importacao",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_arquivo_importacao_erro_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_tenant_plano_id",
                table: "tenant",
                column: "plano_id");

            migrationBuilder.CreateIndex(
                name: "ix_arquivo_importacao_layout_id",
                table: "arquivo_importacao",
                column: "layout_id");

            migrationBuilder.CreateIndex(
                name: "ix_arquivo_importacao_tenant_id_criado_em",
                table: "arquivo_importacao",
                columns: new[] { "tenant_id", "criado_em" });

            migrationBuilder.CreateIndex(
                name: "ix_arquivo_importacao_tenant_id_status",
                table: "arquivo_importacao",
                columns: new[] { "tenant_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_arquivo_importacao_usuario_id",
                table: "arquivo_importacao",
                column: "usuario_id");

            migrationBuilder.CreateIndex(
                name: "ix_arquivo_importacao_erro_arquivo_importacao_id_numero_linha",
                table: "arquivo_importacao_erro",
                columns: new[] { "arquivo_importacao_id", "numero_linha" });

            migrationBuilder.CreateIndex(
                name: "ix_arquivo_importacao_erro_tenant_id",
                table: "arquivo_importacao_erro",
                column: "tenant_id");

            migrationBuilder.AddForeignKey(
                name: "fk_tenant_plano_plano_id",
                table: "tenant",
                column: "plano_id",
                principalTable: "plano",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_tenant_plano_plano_id",
                table: "tenant");

            migrationBuilder.DropTable(
                name: "arquivo_importacao_erro");

            migrationBuilder.DropTable(
                name: "uso_mensal");

            migrationBuilder.DropTable(
                name: "arquivo_importacao");

            migrationBuilder.DropIndex(
                name: "ix_tenant_plano_id",
                table: "tenant");

            migrationBuilder.DropColumn(
                name: "plano_id",
                table: "tenant");
        }
    }
}
