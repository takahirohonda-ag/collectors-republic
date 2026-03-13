-- Seed data for CollectorsRepublic

-- 1. Card Series
INSERT INTO card_series (id, slug, name, description, active, sort_order, created_at) VALUES
  (gen_random_uuid(), 'pokemon', 'Pokémon', 'Classic Pokémon Trading Cards — Pikachu, Charizard & more', true, 1, now()),
  (gen_random_uuid(), 'one-piece', 'One Piece', 'One Piece Card Game — Luffy, Zoro, Shanks & more', true, 2, now())
ON CONFLICT (slug) DO NOTHING;

-- 2. Pokemon Cards
INSERT INTO cards (id, name, image_url, rarity, market_value, series, series_id, created_at)
SELECT gen_random_uuid(), c.name, c.image_url, c.rarity, c.market_value, 'Pokemon', cs.id, now()
FROM (VALUES
  ('Pikachu VMAX', 'https://images.pokemontcg.io/swsh4/44_hires.png', 'tier1', 45),
  ('Charizard VMAX', 'https://images.pokemontcg.io/swsh35/SV107_hires.png', 'tier4', 450),
  ('Rayquaza VMAX', 'https://images.pokemontcg.io/swsh7/218_hires.png', 'tier3', 180),
  ('Umbreon VMAX', 'https://images.pokemontcg.io/swsh7/215_hires.png', 'tier4', 500),
  ('Galarian Darmanitan', 'https://images.pokemontcg.io/swsh4/37_hires.png', 'tier1', 35),
  ('Centiskorch', 'https://images.pokemontcg.io/swsh3/39_hires.png', 'tier1', 40),
  ('Espeon VMAX', 'https://images.pokemontcg.io/swsh5/65_hires.png', 'tier2', 95),
  ('Lugia V', 'https://images.pokemontcg.io/swsh12pt5/186_hires.png', 'tier3', 220),
  ('Gengar VMAX', 'https://images.pokemontcg.io/swsh8/271_hires.png', 'tier2', 75),
  ('Mew VMAX', 'https://images.pokemontcg.io/swsh9/114_hires.png', 'tier2', 85),
  ('Flareon VMAX', 'https://images.pokemontcg.io/swsh7/18_hires.png', 'tier1', 30),
  ('Blaziken VMAX', 'https://images.pokemontcg.io/swsh6/21_hires.png', 'tier2', 70)
) AS c(name, image_url, rarity, market_value)
CROSS JOIN card_series cs WHERE cs.slug = 'pokemon';

-- 3. One Piece Cards
INSERT INTO cards (id, name, image_url, rarity, market_value, series, series_id, created_at)
SELECT gen_random_uuid(), c.name, c.image_url, c.rarity, c.market_value, 'One Piece', cs.id, now()
FROM (VALUES
  ('Monkey D. Luffy (Leader)', 'https://en.onepiece-cardgame.com/images/cardlist/card/ST01-001.png', 'tier1', 50),
  ('Roronoa Zoro', 'https://en.onepiece-cardgame.com/images/cardlist/card/ST01-013.png', 'tier1', 40),
  ('Nami', 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-016.png', 'tier2', 90),
  ('Portgas D. Ace', 'https://en.onepiece-cardgame.com/images/cardlist/card/OP02-013.png', 'tier2', 85),
  ('Shanks', 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-120.png', 'tier3', 200),
  ('Nico Robin', 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-017.png', 'tier3', 175),
  ('Kaido', 'https://en.onepiece-cardgame.com/images/cardlist/card/OP03-099.png', 'tier4', 380),
  ('Monkey D. Luffy (Gear 5)', 'https://en.onepiece-cardgame.com/images/cardlist/card/OP05-119.png', 'tier4', 650),
  ('Trafalgar Law', 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-047.png', 'tier1', 35),
  ('Sanji', 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-013.png', 'tier2', 80)
) AS c(name, image_url, rarity, market_value)
CROSS JOIN card_series cs WHERE cs.slug = 'one-piece';

-- 4. Gacha Packs
INSERT INTO gacha_packs (id, name, tier, price, expected_value, description, category, series_id, active, created_at)
SELECT gen_random_uuid(), p.name, p.tier, p.price, p.expected_value, p.description, p.category, cs.id, true, now()
FROM (VALUES
  ('Pokemon Basic Pack', 'basic', 100, 50, 'Great starter pack. Common & uncommon Pokémon cards with a chance at rare pulls.', 'Pokemon', 'pokemon'),
  ('Pokemon Elite Pack', 'elite', 500, 280, 'Premium pack with better odds. Higher chance of pulling rare & ultra-rare cards.', 'Pokemon', 'pokemon'),
  ('Pokemon Legendary Pack', 'legendary', 2000, 1200, 'The ultimate pack. Guaranteed high-value cards with the best odds for legendaries.', 'Pokemon', 'pokemon'),
  ('One Piece Basic Pack', 'basic', 100, 55, 'Set sail! Common One Piece cards with a shot at super rares.', 'One Piece', 'one-piece'),
  ('One Piece Elite Pack', 'elite', 500, 300, 'Nakama power! Better odds for rare and legendary One Piece cards.', 'One Piece', 'one-piece'),
  ('One Piece Legendary Pack', 'legendary', 2000, 1300, 'Pirate King tier! Maximum rarity odds with the rarest One Piece cards.', 'One Piece', 'one-piece')
) AS p(name, tier, price, expected_value, description, category, series_slug)
JOIN card_series cs ON cs.slug = p.series_slug;

-- 5. Pack Probabilities
-- Pokemon Basic
INSERT INTO pack_probabilities (id, pack_id, rarity, label, percentage, value_range_min, value_range_max, color)
SELECT gen_random_uuid(), gp.id, pr.rarity, pr.label, pr.percentage, pr.value_range_min, pr.value_range_max, pr.color
FROM gacha_packs gp
CROSS JOIN (VALUES
  ('tier1', 'Tier 1', 80, 30, 60, '#22c55e'),
  ('tier2', 'Tier 2', 15, 60, 110, '#3b82f6'),
  ('tier3', 'Tier 3', 4, 110, 250, '#a855f7'),
  ('tier4', 'Tier 4', 1, 250, 2000, '#f59e0b')
) AS pr(rarity, label, percentage, value_range_min, value_range_max, color)
WHERE gp.name = 'Pokemon Basic Pack';

-- Pokemon Elite
INSERT INTO pack_probabilities (id, pack_id, rarity, label, percentage, value_range_min, value_range_max, color)
SELECT gen_random_uuid(), gp.id, pr.rarity, pr.label, pr.percentage, pr.value_range_min, pr.value_range_max, pr.color
FROM gacha_packs gp
CROSS JOIN (VALUES
  ('tier1', 'Tier 1', 60, 100, 200, '#22c55e'),
  ('tier2', 'Tier 2', 25, 200, 400, '#3b82f6'),
  ('tier3', 'Tier 3', 12, 400, 800, '#a855f7'),
  ('tier4', 'Tier 4', 3, 800, 5000, '#f59e0b')
) AS pr(rarity, label, percentage, value_range_min, value_range_max, color)
WHERE gp.name = 'Pokemon Elite Pack';

-- Pokemon Legendary
INSERT INTO pack_probabilities (id, pack_id, rarity, label, percentage, value_range_min, value_range_max, color)
SELECT gen_random_uuid(), gp.id, pr.rarity, pr.label, pr.percentage, pr.value_range_min, pr.value_range_max, pr.color
FROM gacha_packs gp
CROSS JOIN (VALUES
  ('tier1', 'Tier 1', 50, 500, 1000, '#22c55e'),
  ('tier2', 'Tier 2', 30, 1000, 2000, '#3b82f6'),
  ('tier3', 'Tier 3', 15, 2000, 5000, '#a855f7'),
  ('tier4', 'Tier 4', 5, 5000, 20000, '#f59e0b')
) AS pr(rarity, label, percentage, value_range_min, value_range_max, color)
WHERE gp.name = 'Pokemon Legendary Pack';

-- One Piece Basic
INSERT INTO pack_probabilities (id, pack_id, rarity, label, percentage, value_range_min, value_range_max, color)
SELECT gen_random_uuid(), gp.id, pr.rarity, pr.label, pr.percentage, pr.value_range_min, pr.value_range_max, pr.color
FROM gacha_packs gp
CROSS JOIN (VALUES
  ('tier1', 'Tier 1', 75, 30, 60, '#22c55e'),
  ('tier2', 'Tier 2', 18, 60, 110, '#3b82f6'),
  ('tier3', 'Tier 3', 5, 110, 250, '#a855f7'),
  ('tier4', 'Tier 4', 2, 250, 2000, '#f59e0b')
) AS pr(rarity, label, percentage, value_range_min, value_range_max, color)
WHERE gp.name = 'One Piece Basic Pack';

-- One Piece Elite
INSERT INTO pack_probabilities (id, pack_id, rarity, label, percentage, value_range_min, value_range_max, color)
SELECT gen_random_uuid(), gp.id, pr.rarity, pr.label, pr.percentage, pr.value_range_min, pr.value_range_max, pr.color
FROM gacha_packs gp
CROSS JOIN (VALUES
  ('tier1', 'Tier 1', 55, 100, 200, '#22c55e'),
  ('tier2', 'Tier 2', 28, 200, 400, '#3b82f6'),
  ('tier3', 'Tier 3', 13, 400, 800, '#a855f7'),
  ('tier4', 'Tier 4', 4, 800, 5000, '#f59e0b')
) AS pr(rarity, label, percentage, value_range_min, value_range_max, color)
WHERE gp.name = 'One Piece Elite Pack';

-- One Piece Legendary
INSERT INTO pack_probabilities (id, pack_id, rarity, label, percentage, value_range_min, value_range_max, color)
SELECT gen_random_uuid(), gp.id, pr.rarity, pr.label, pr.percentage, pr.value_range_min, pr.value_range_max, pr.color
FROM gacha_packs gp
CROSS JOIN (VALUES
  ('tier1', 'Tier 1', 45, 500, 1000, '#22c55e'),
  ('tier2', 'Tier 2', 30, 1000, 2000, '#3b82f6'),
  ('tier3', 'Tier 3', 18, 2000, 5000, '#a855f7'),
  ('tier4', 'Tier 4', 7, 5000, 20000, '#f59e0b')
) AS pr(rarity, label, percentage, value_range_min, value_range_max, color)
WHERE gp.name = 'One Piece Legendary Pack';

-- 6. Pack-Card associations (all cards in a series go into all packs of that series)
INSERT INTO pack_cards (id, pack_id, card_id)
SELECT gen_random_uuid(), gp.id, c.id
FROM gacha_packs gp
JOIN cards c ON c.series_id = gp.series_id;

-- 7. Coin Packages
INSERT INTO coin_packages (id, coins, bonus_coins, price_aed, popular, sort_order, active, created_at) VALUES
  (gen_random_uuid(), 500, 0, 1800, false, 1, true, now()),
  (gen_random_uuid(), 1200, 200, 3700, true, 2, true, now()),
  (gen_random_uuid(), 3500, 500, 9200, false, 3, true, now()),
  (gen_random_uuid(), 10000, 2000, 18400, false, 4, true, now());

-- 8. Exchange Rates
INSERT INTO exchange_rates (id, currency, rate_to_aed, source, valid_at, created_at) VALUES
  (gen_random_uuid(), 'USD', 3.6725, 'manual', now(), now()),
  (gen_random_uuid(), 'EUR', 3.98, 'manual', now(), now()),
  (gen_random_uuid(), 'JPY', 0.0245, 'manual', now(), now()),
  (gen_random_uuid(), 'GBP', 4.64, 'manual', now(), now());
