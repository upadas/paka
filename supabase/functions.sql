-- Run these in Supabase SQL Editor after schema.sql

create or replace function increment_stat(p_recipe_id text, p_col text)
returns void language plpgsql security definer as $$
begin
  execute format(
    'update recipe_stats set %I = %I + 1, updated_at = now() where recipe_id = $1',
    p_col, p_col
  ) using p_recipe_id;
end;
$$;

create or replace function decrement_stat(p_recipe_id text, p_col text)
returns void language plpgsql security definer as $$
begin
  execute format(
    'update recipe_stats set %I = greatest(0, %I - 1), updated_at = now() where recipe_id = $1',
    p_col, p_col
  ) using p_recipe_id;
end;
$$;
