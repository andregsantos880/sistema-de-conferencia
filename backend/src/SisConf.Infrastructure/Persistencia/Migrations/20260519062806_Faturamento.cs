using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SisConf.Infrastructure.Persistencia.Migrations
{
    /// <inheritdoc />
    public partial class Faturamento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "assinatura",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    plano_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    iniciada_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    proxima_cobranca_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    cancelada_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    stripe_subscription_id = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    atualizado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assinatura", x => x.id);
                    table.ForeignKey(
                        name: "fk_assinatura_plano_plano_id",
                        column: x => x.plano_id,
                        principalTable: "plano",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_assinatura_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "stripe_evento",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tipo = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    stripe_event_id = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    payload_json = table.Column<string>(type: "jsonb", nullable: false),
                    processado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    erro_processamento = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    recebido_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    atualizado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_stripe_evento", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "fatura",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assinatura_id = table.Column<Guid>(type: "uuid", nullable: true),
                    stripe_invoice_id = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    numero = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    valor_centavos = table.Column<int>(type: "integer", nullable: false),
                    vencimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    pago_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    payment_method = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    link_pagamento = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    link_pdf = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    atualizado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_fatura", x => x.id);
                    table.ForeignKey(
                        name: "fk_fatura_assinatura_assinatura_id",
                        column: x => x.assinatura_id,
                        principalTable: "assinatura",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_fatura_tenant_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenant",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_assinatura_plano_id",
                table: "assinatura",
                column: "plano_id");

            migrationBuilder.CreateIndex(
                name: "ix_assinatura_stripe_subscription_id",
                table: "assinatura",
                column: "stripe_subscription_id",
                unique: true,
                filter: "stripe_subscription_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_assinatura_tenant_id",
                table: "assinatura",
                column: "tenant_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_fatura_assinatura_id",
                table: "fatura",
                column: "assinatura_id");

            migrationBuilder.CreateIndex(
                name: "ix_fatura_stripe_invoice_id",
                table: "fatura",
                column: "stripe_invoice_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_fatura_tenant_id_vencimento",
                table: "fatura",
                columns: new[] { "tenant_id", "vencimento" });

            migrationBuilder.CreateIndex(
                name: "ix_stripe_evento_stripe_event_id",
                table: "stripe_evento",
                column: "stripe_event_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "fatura");

            migrationBuilder.DropTable(
                name: "stripe_evento");

            migrationBuilder.DropTable(
                name: "assinatura");
        }
    }
}
