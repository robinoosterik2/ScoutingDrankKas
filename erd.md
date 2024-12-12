# Entity-Relationship Diagram (ERD)

## Entities

### user

- **user_id** (Primary Key)
- username (Unique, Indexed)
- first_name
- last_name
- email (Unique, Indexed)
- password
- created_at
- updated_at
- active
- balance
- role_id (Foreign Key, Indexed)
- jwt_token

### role

- **role_id** (Primary Key)
- name (Unique, Indexed)

### product

- **product_id** (Primary Key)
- name (Indexed)
- description
- price
- category_id (Foreign Key, Indexed)

### category

- **category_id** (Primary Key)
- name (Unique, Indexed)

### order

- **order_id** (Primary Key)
- order_date
- user_id (Foreign Key, Indexed)
- total_amount
- bartender_id (Foreign Key, Indexed)

### product_order

- **product_id** (Foreign Key, Indexed)
- **order_id** (Foreign Key, Indexed)

### log

- **log_id** (Primary Key)
- user_id (Foreign Key, Indexed)
- action
- timestamp

### stock

- **product_id** (Foreign Key, Indexed)
- quantity
- last_updated

## Relationships

- A **user** can place multiple **orders**.
- An **order** can contain multiple **products**.
- A **product** can be part of multiple **orders**.
- A **user** can perform multiple **logs**.
- A **bartender** is a user who made the **order**.
- A **product** has a **stock** entry.
- A **user** has a **role**.
- A **product** belongs to a **category**.

## Diagram

```mermaid
erDiagram

    user {
        int id pk
        string username
        string first_name
        string last_name
        string email
        string password
        datetime created_at
        datetime updated_at
        boolean active
        int balance
        int role_id fk
        string jwt_token
    }

    role {
        int id pk
        string name
    }

    product {
        int id pk 
        string name
        string description
        float price
        int category_id fk
    }

    category {
        int id pk
        string name
    }

    product_order {
        int product_id fk
        int order_id fk
    }

    order {
        int id pk
        date order_date
        int user_id fk
        float total_amount
        bartender bartender_id fk
    }

    log {
        int id pk
        int user_id fk
        string action
        datetime timestamp
    }

    stock {
        int product_id fk
        int quantity
        datetime last_updated
    }

    user ||--o{ order : places
    order ||--o{ product_order : contains
    product ||--o{ product_order : part_of
    user ||--o{ log : performs
    product ||--o{ stock : has
    user ||--o{ order : bartends
    user ||--|| role : has
    product ||--|| category : belongs_to
```
