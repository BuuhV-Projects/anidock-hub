import { Button } from "@/packages/shared-ui/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const LGPD = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-6 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">LGPD - Lei Geral de Proteção de Dados</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Compromisso com a LGPD</h2>
            <p>
              O AniDock está comprometido em cumprir a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). 
              Este documento explica como tratamos dados pessoais em conformidade com a legislação brasileira.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Natureza do Software</h2>
            <p>
              O AniDock é um software desktop que funciona inteiramente de forma local no computador 
              do usuário. Por design, não realizamos coleta, processamento ou armazenamento centralizado 
              de dados pessoais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Princípios da LGPD Aplicados</h2>
            <p>Seguimos os seguintes princípios da LGPD:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Finalidade:</strong> Dados locais são usados apenas para funcionamento do software</li>
              <li><strong>Adequação:</strong> Processamento local compatível com as finalidades informadas</li>
              <li><strong>Necessidade:</strong> Limitação ao mínimo necessário para funcionamento</li>
              <li><strong>Transparência:</strong> Informações claras sobre o funcionamento</li>
              <li><strong>Segurança:</strong> Dados ficam protegidos no computador do usuário</li>
              <li><strong>Prevenção:</strong> Design que evita coleta desnecessária de dados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Bases Legais</h2>
            <p>
              Como o software não coleta dados pessoais centralizadamente, não há processamento 
              que requeira bases legais da LGPD. Todo armazenamento é local e controlado pelo usuário.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Direitos do Titular</h2>
            <p>Embora não processemos dados centralizadamente, reconhecemos seus direitos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmação da existência de tratamento (não aplicável - dados são locais)</li>
              <li>Acesso aos dados (total - todos ficam no seu computador)</li>
              <li>Correção de dados incompletos (você controla seus dados locais)</li>
              <li>Anonimização, bloqueio ou eliminação (desinstale o software)</li>
              <li>Portabilidade (exporte seus drivers e índices)</li>
              <li>Eliminação dos dados (delete os arquivos locais)</li>
              <li>Revogação do consentimento (não aplicável - dados são locais)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Dados de Menores de Idade</h2>
            <p>
              O software pode ser usado por menores de idade sob supervisão dos responsáveis. 
              Como não coletamos dados, não há processamento especial necessário.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Transferência Internacional</h2>
            <p>
              Não realizamos transferência internacional de dados pessoais, pois não coletamos 
              ou transmitimos dados dos usuários.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Encarregado de Dados (DPO)</h2>
            <p>
              Dada a natureza local do software, não mantemos um encarregado de dados formal. 
              Para questões relacionadas à LGPD, entre em contato através dos nossos canais de suporte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Alterações</h2>
            <p>
              Esta política pode ser atualizada para refletir mudanças nas práticas ou na legislação. 
              Recomendamos revisar periodicamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contato</h2>
            <p>
              Para questões sobre LGPD e tratamento de dados, entre em contato através do nosso 
              repositório no GitHub ou email de suporte.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LGPD;
