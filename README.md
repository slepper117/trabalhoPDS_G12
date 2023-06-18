## trabalhoPDS_G12 - LESI - IPCA

Projeto desenvolvido para a disciplina de Projeto de Desenvolvimento de Software.

Esta disciplina faz parte do segundo ano curricular da Licenciatura em Engenharia de Sistemas Informáticos.

## Contextualização do Trabalho

Pretende-se com a execução deste trabalho consolidar os nossos conhecimentos no desenvolvimento de um sistema, para complementar com o trabalho de Programação Web.

Para tal, utilizaremos o material lecionado nas aulas como referência, tentando criar uma plataforma que suportará as operações CRUD, sobre a informação disponibilizada, através de uma base de dados em PostgreSQL e posteriormente o desenvolvimento de um Frontend para gerir o sistema.

### Requisitos Funcionais

O projeto terá os seguintes requisitos funcionais:

**Gerir Pontos (entrada e saída)** - O sistema deverá de permitir as operações CRUD num ponto, permitindo a adição manual ou correção de um ponto.

**Gerir Reservas** - O sistema deverá de permitir as operações CRUD numa reserva, atendendo ao facto da existência de salas disponíveis para o efeito.

**Validação de uma Reserva** - Uma reserva será sempre necessária ser validada por um Supervisor.

**Gerir Salas** - O sistema deverá de permitir as operações CRUD de salas para a criação de reservas.

**Gerir Áreas** - O sistema deverá de permitir as operações CRUD de salas para a criação de reservas.

**Associar um utilizador a uma área** - O sistema deverá de permitir associar um utilizador a uma área ou vice-versa.

**Gerir Utilizador** - O sistema deverá de permitir as operações CRUD de utilizadores para interagir com o sistema.

**Autenticação** - O sistema deverá de permitir a autenticação, para poder autorizar e identificar o utilizador que está a efetuar a operação.

**Autorização** - O sistema deverá de permitir vários níveis de autorização, limitando as permissões que cada ator tem no sistema.

**Acesso** - O sistema deverá de permitir a validação de acesso a uma sala, área, entrada ou saída da empresa.

## Backend

O [backend](backend) foi desenvolvido com recurso à framework Express.JS num servidor Node.JS.

## Database

A [database](database) foi desenvolvida em SQL e implementada num servidor de PostgreSQL.

## Contribuidores

| Nome           | Número | Função                  |
| -------------- | ------ | ----------------------- |
| Renato Dantas  | 6160   | Product Owner           |
| Fábio Mota     | 9710   | Scrum Master            |
| João Morais    | 17214  | Development team member |
| André Ferreira | 20764  | Development team member |
| Sérgio Ribeiro | 18858  | Development team member |
