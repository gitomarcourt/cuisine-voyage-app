-- Fonction pour exécuter du SQL dynamique de manière sécurisée
CREATE OR REPLACE FUNCTION public.execute_sql(query text)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data json;
BEGIN
  IF query ~* '^SELECT' THEN
    -- Pour les requêtes SELECT, retourner les résultats
    FOR result_data IN EXECUTE query LOOP
      RETURN NEXT row_to_json(result_data);
    END LOOP;
  ELSE
    -- Pour les requêtes d'insertion/mise à jour, les exécuter avec RETURNING
    FOR result_data IN EXECUTE query LOOP
      RETURN NEXT row_to_json(result_data);
    END LOOP;
  END IF;
  RETURN;
END;
$$; 