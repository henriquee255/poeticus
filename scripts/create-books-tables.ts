const supabaseUrl = "https://srnkqabohwdbhfdpulsw.supabase.co"
const supabaseKey = "sb_secret_r24ueQ3xhN2tyPWu-Kn4kA_nLrd3kJy"

const sql = `
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  cover_image text,
  author_name text,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  chapter_number int NOT NULL,
  created_at timestamptz DEFAULT now()
);
`

async function run() {
    console.log("Criando tabelas no Supabase...")

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ query: sql })
    })

    if (!res.ok) {
        // Fallback: try pg-meta API
        const res2 = await fetch(`${supabaseUrl}/pg-meta/v1/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({ query: sql })
        })

        if (!res2.ok) {
            const err = await res2.text()
            console.error("Erro ao criar tabelas:", err)
            console.log("\nCrie as tabelas manualmente no Supabase SQL Editor com o SQL abaixo:")
            console.log(sql)
            process.exit(1)
        }

        console.log("Tabelas criadas com sucesso!")
        return
    }

    console.log("Tabelas criadas com sucesso!")
}

run()
