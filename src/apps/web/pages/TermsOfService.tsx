import { Button } from '@anidock/shared-ui';
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-4xl font-display font-bold mb-8">Termos de Uso</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao baixar, instalar ou utilizar o AniDock, você concorda em ficar vinculado a estes Termos de Uso. 
              Se você não concordar com estes termos, não utilize o software.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Descrição do Serviço</h2>
            <p>
              O AniDock é um software desktop para Windows que permite aos usuários indexar e organizar informações 
              sobre animes disponíveis publicamente na internet. O software armazena apenas metadados (títulos, 
              sinopses, capas) localmente no computador do usuário.
            </p>
            <p className="mt-4">
              O AniDock NÃO hospeda, armazena, distribui ou transmite qualquer conteúdo de vídeo. O software apenas 
              organiza links e informações de sites de terceiros que o usuário escolhe indexar.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Responsabilidades do Usuário</h2>
            <p>Ao utilizar o AniDock, você concorda em:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Utilizar o software apenas para fins legais e de acordo com todas as leis aplicáveis</li>
              <li>Não utilizar o software para violar direitos autorais ou propriedade intelectual de terceiros</li>
              <li>Respeitar os termos de uso dos sites que você escolher indexar</li>
              <li>Assumir total responsabilidade pelo conteúdo que escolher indexar e acessar</li>
              <li>Não utilizar o software para distribuir, compartilhar ou facilitar o acesso a conteúdo pirata</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Limitação de Responsabilidade</h2>
            <p>
              O AniDock é fornecido "como está", sem garantias de qualquer tipo. Nós não somos responsáveis por:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Conteúdo acessado através de sites de terceiros</li>
              <li>Precisão, legalidade ou disponibilidade de conteúdo indexado</li>
              <li>Danos diretos ou indiretos resultantes do uso do software</li>
              <li>Violações de direitos autorais cometidas por usuários</li>
              <li>Interrupções ou erros no funcionamento do software</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Propriedade Intelectual</h2>
            <p>
              O AniDock e todo seu código, design e documentação são propriedade de seus desenvolvedores e estão 
              protegidos por leis de direitos autorais. Você não pode reproduzir, modificar ou distribuir o software 
              sem autorização expressa.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Modificações dos Termos</h2>
            <p>
              Reservamos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor 
              imediatamente após a publicação. O uso continuado do software após modificações constitui aceitação 
              dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Rescisão</h2>
            <p>
              Podemos rescindir ou suspender seu acesso ao software imediatamente, sem aviso prévio, por qualquer 
              motivo, incluindo violação destes Termos de Uso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Lei Aplicável</h2>
            <p>
              Estes termos são regidos pelas leis brasileiras. Quaisquer disputas serão resolvidas nos tribunais 
              brasileiros competentes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contato</h2>
            <p>
              Para questões sobre estes termos, entre em contato através do nosso site oficial.
            </p>
          </section>

          <p className="text-sm mt-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
