# Finance API

Este repositório contém a implementação da **Finance API**, que é responsável por gerenciar contas financeiras, transações (depósitos, retiradas, transferências), e relatórios financeiros. A API também lida com funcionalidades avançadas como suporte a múltiplas moedas e taxa de câmbio.

## Tecnologias Utilizadas

- **NestJS**: Framework utilizado para criar a API.
- **PostgreSQL**: Banco de dados relacional para armazenar informações de contas e transações.
- **TypeORM**: ORM para integração com o banco de dados PostgreSQL.
- **Bull + Redis**: Processamento de filas para tarefas assíncronas (como taxas de câmbio e transações agendadas).
- **JWT**: Autenticação segura via token JWT.
- **node**: >= 20

## Pré-requisitos

Antes de rodar o projeto, certifique-se de ter o Docker e o Docker Compose instalados na sua máquina.

- **Docker**: [Instruções de instalação do Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Instruções de instalação do Docker Compose](https://docs.docker.com/compose/install/)

## Como Rodar o Projeto

### 1. Clone o Repositório

Clone o repositório para sua máquina local:

```bash
git clone https://github.com/Lucaswillians/finance-api.git
cd finance-api
```

### Testando os Endpoints com o Insomnia
Para facilitar a interação com a API, um arquivo de configuração do Insomnia contendo todos os endpoints está disponível no repositório. Você pode importá-lo para o Insomnia e testar as funcionalidades da API de forma simples.

Instruções para usar o arquivo do Insomnia:
- Faça o download do arquivo financial-api-insomnia.json disponível na raiz do repositório.
- Abra o Insomnia e clique em Importar.
- Selecione o arquivo financial-api-insomnia.json.
- Agora, você pode testar todos os endpoints da API diretamente no Insomnia, incluindo autenticação e operações financeiras.


## Docker:
- Rode o comando ``docker compose up -d`` para rodar os bancos de daddos

## Executar o projeto
- ``npm run start:dev``

## Rodar os testes
- ``npm run test --caminho do arquivo de teste--``
