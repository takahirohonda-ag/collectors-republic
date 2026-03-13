-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatar_url" TEXT,
    "coin_balance" INTEGER NOT NULL DEFAULT 0,
    "point_balance" INTEGER NOT NULL DEFAULT 0,
    "member_tier" TEXT NOT NULL DEFAULT 'Bronze',
    "supabase_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_series" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "market_value" INTEGER NOT NULL,
    "series" TEXT NOT NULL,
    "series_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gacha_packs" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "expected_value" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "series_id" UUID,
    "machine_image_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gacha_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pack_probabilities" (
    "id" UUID NOT NULL,
    "pack_id" UUID NOT NULL,
    "rarity" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "value_range_min" INTEGER NOT NULL,
    "value_range_max" INTEGER NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "pack_probabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pack_cards" (
    "id" UUID NOT NULL,
    "pack_id" UUID NOT NULL,
    "card_id" UUID NOT NULL,

    CONSTRAINT "pack_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "card_id" UUID NOT NULL,
    "acquired_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'in_collection',
    "sell_back_value" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pull_history" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "pack_id" UUID NOT NULL,
    "card_id" UUID NOT NULL,
    "coins_spent" INTEGER NOT NULL,
    "pulled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pull_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "provider" TEXT NOT NULL,
    "provider_payment_id" TEXT,
    "provider_session_id" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "amount_aed" INTEGER NOT NULL,
    "exchange_rate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "provider_fee" INTEGER,
    "net_amount" INTEGER,
    "coin_package_id" TEXT,
    "coins_granted" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" UUID NOT NULL,
    "currency" TEXT NOT NULL,
    "rate_to_aed" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "valid_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coin_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "reference_id" TEXT,
    "payment_id" UUID,
    "stripe_payment_id" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coin_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_orders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "address_json" JSONB NOT NULL,
    "tracking_number" TEXT,
    "carrier" TEXT,
    "carrier_service" TEXT,
    "shipping_cost_aed" INTEGER,
    "estimated_delivery" TIMESTAMP(3),
    "actual_delivery" TIMESTAMP(3),
    "carrier_tracking_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "collection_id" UUID NOT NULL,

    CONSTRAINT "shipping_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coin_packages" (
    "id" UUID NOT NULL,
    "coins" INTEGER NOT NULL,
    "bonus_coins" INTEGER NOT NULL DEFAULT 0,
    "price_aed" INTEGER NOT NULL,
    "stripe_price_id" TEXT,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coin_packages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_supabase_id_key" ON "users"("supabase_id");

-- CreateIndex
CREATE UNIQUE INDEX "card_series_slug_key" ON "card_series"("slug");

-- CreateIndex
CREATE INDEX "cards_series_id_idx" ON "cards"("series_id");

-- CreateIndex
CREATE INDEX "cards_rarity_idx" ON "cards"("rarity");

-- CreateIndex
CREATE INDEX "gacha_packs_series_id_idx" ON "gacha_packs"("series_id");

-- CreateIndex
CREATE UNIQUE INDEX "pack_cards_pack_id_card_id_key" ON "pack_cards"("pack_id", "card_id");

-- CreateIndex
CREATE INDEX "collections_user_id_status_idx" ON "collections"("user_id", "status");

-- CreateIndex
CREATE INDEX "pull_history_user_id_pulled_at_idx" ON "pull_history"("user_id", "pulled_at");

-- CreateIndex
CREATE INDEX "payments_user_id_created_at_idx" ON "payments"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "payments_provider_status_idx" ON "payments"("provider", "status");

-- CreateIndex
CREATE INDEX "payments_currency_created_at_idx" ON "payments"("currency", "created_at");

-- CreateIndex
CREATE INDEX "payments_provider_payment_id_idx" ON "payments"("provider_payment_id");

-- CreateIndex
CREATE INDEX "exchange_rates_currency_idx" ON "exchange_rates"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_currency_valid_at_key" ON "exchange_rates"("currency", "valid_at");

-- CreateIndex
CREATE INDEX "coin_transactions_user_id_created_at_idx" ON "coin_transactions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "coin_transactions_type_created_at_idx" ON "coin_transactions"("type", "created_at");

-- CreateIndex
CREATE INDEX "shipping_orders_status_idx" ON "shipping_orders"("status");

-- CreateIndex
CREATE INDEX "shipping_orders_carrier_idx" ON "shipping_orders"("carrier");

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "card_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gacha_packs" ADD CONSTRAINT "gacha_packs_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "card_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_probabilities" ADD CONSTRAINT "pack_probabilities_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "gacha_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_cards" ADD CONSTRAINT "pack_cards_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "gacha_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_cards" ADD CONSTRAINT "pack_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pull_history" ADD CONSTRAINT "pull_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pull_history" ADD CONSTRAINT "pull_history_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "gacha_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pull_history" ADD CONSTRAINT "pull_history_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coin_transactions" ADD CONSTRAINT "coin_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_orders" ADD CONSTRAINT "shipping_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_items" ADD CONSTRAINT "shipping_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "shipping_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_items" ADD CONSTRAINT "shipping_items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
