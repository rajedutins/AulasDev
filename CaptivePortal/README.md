# CaptivePortal — UNDB

Frontend responsivo de uma página de autenticação de internet para um Centro Universitário. HTML5, CSS3 e JavaScript puro, sem dependências externas.

## Executar

Abra `index.html` em um navegador moderno ou use o Live Server do VS Code. Não é necessário instalar pacotes ou compilar.

## Arquivos

- `index.html`: estrutura acessível, formulário e diálogo de orientações.
- `css/style.css`: identidade visual, layouts para computador e celular.
- `js/script.js`: perfis, validação, exibição de senha e demonstração do envio.

## Recursos

- Perfis de aluno, colaborador (incluindo professores) e visitante.
- Rótulos e instruções adaptados ao perfil.
- Campos obrigatórios e aceite de orientações de uso.
- Botão para mostrar e ocultar senha.
- Diálogo acessível com fechamento por botão e Escape.
- Feedback de demonstração sem armazenamento ou envio de credenciais.
- Layout sem fontes ou recursos externos, adequado como base para uma rede com acesso restrito.

## Escopo e integração futura

Esta é uma interface demonstrativa. Não verifica credenciais, não cria sessões e não libera acesso à internet. Use dados fictícios ao testar.

Identidade visual adaptada à logo UNDB fornecida em `images/logo_undb.png`, preservando o arquivo original. As cores da interface foram inspiradas nessa logo; não constituem um manual oficial de marca.

Site oficial: https://www.undb.edu.br/

Central de Ajuda, vinculada no site oficial: https://ajuda.undb.edu.br/

Os textos de autenticação e as orientações continuam provisórios e precisam de validação institucional. Os links externos podem depender de liberação no gateway antes da autenticação.

Para uso real, identifique primeiro o gateway/controlador (por exemplo, MikroTik, pfSense ou UniFi) e seu contrato de autenticação. Integre o formulário ao endpoint fornecido pelo administrador de rede, usando HTTPS, sem colocar segredos no JavaScript. O controlador deve decidir sobre autorização, duração e encerramento de sessão. Redirecionamentos e parâmetros do portal devem seguir o contrato do equipamento e ser validados pelo servidor. Publique as informações de privacidade e os canais oficiais de atendimento definidos pela instituição.

## Verificação manual

1. Abra em computador e celular; confira se não há rolagem horizontal.
2. Alterne entre os três perfis e confira rótulos e limpeza dos campos.
3. Teste campos vazios, espaços em branco e ausência de aceite.
4. Use somente dados fictícios, envie e confira a mensagem de demonstração.
5. Teste Mostrar/Ocultar e confirme que a senha é limpa após o envio válido.
6. Navegue por Tab e abra/feche as orientações, inclusive com Escape.

O projeto foi criado localmente dentro de AulasDev. A publicação e a integração com a rede são etapas separadas.
