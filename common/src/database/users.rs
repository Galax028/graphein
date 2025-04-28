use sqlx::{PgConnection, Postgres, QueryBuilder};

use crate::{
    AppError, SqlxResult,
    error::ForbiddenError,
    schemas::{Tel, User, UserId, enums::UserRole},
};

pub struct UsersTable;

impl UsersTable {
    pub async fn create_new(
        conn: &mut PgConnection,
        role: UserRole,
        email: &str,
        name: &str,
        profile_url: &str,
    ) -> SqlxResult<UserId> {
        let row = sqlx::query!(
            "\
            INSERT INTO users (role, email, name, profile_url)\
            VALUES ($1, $2, $3, $4) RETURNING id as \"id: UserId\"\
            ",
            role as UserRole,
            email,
            name,
            profile_url,
        )
        .fetch_one(conn)
        .await?;

        Ok(row.id)
    }

    pub async fn fetch_one(conn: &mut PgConnection, id: UserId) -> SqlxResult<User> {
        sqlx::query_as(
            "\
            SELECT id, role, email, name, tel, class, class_no, profile_url, is_onboarded \
            FROM users WHERE id = $1\
            ",
        )
        .bind(id)
        .fetch_one(conn)
        .await
    }

    pub async fn fetch_role(conn: &mut PgConnection, id: UserId) -> SqlxResult<UserRole> {
        sqlx::query_scalar("SELECT role FROM users WHERE id = $1")
            .bind(id)
            .fetch_one(conn)
            .await
    }

    async fn fetch_for_session(
        conn: &mut PgConnection,
        email: &str,
    ) -> SqlxResult<Option<(UserId, UserRole, bool)>> {
        if let Some(res) = sqlx::query!(
            "\
            SELECT id AS \"id: UserId\", role AS \"role: UserRole\", is_onboarded \
            FROM users WHERE email = $1\
            ",
            email,
        )
        .fetch_optional(conn)
        .await?
        {
            Ok(Some((res.id, res.role, res.is_onboarded)))
        } else {
            Ok(None)
        }
    }

    #[must_use]
    pub fn update<'args>(id: UserId) -> UserUpdateBuilder<'args> {
        UserUpdateBuilder {
            qb: QueryBuilder::new("UPDATE users SET "),
            first_bind: true,
            id,
        }
    }

    pub async fn get_or_create_user_for_session(
        conn: &mut PgConnection,
        email: &str,
        email_domain: &str,
        name: &str,
        profile_url: &str,
    ) -> Result<(UserId, UserRole, bool), AppError> {
        Ok(
            if let Some(user) = UsersTable::fetch_for_session(conn, email).await? {
                user
            } else {
                let user_role = match email_domain {
                    "student.sk.ac.th" => UserRole::Student,
                    "sk.ac.th" => UserRole::Teacher,
                    _ => {
                        return Err(AppError::Forbidden(ForbiddenError::NonOrganizationSignup));
                    }
                };

                (
                    Self::create_new(conn, user_role, email, name, profile_url).await?,
                    user_role,
                    false,
                )
            },
        )
    }
}

pub struct UserUpdateBuilder<'args> {
    qb: QueryBuilder<'args, Postgres>,
    first_bind: bool,
    id: UserId,
}

impl<'args> UserUpdateBuilder<'args> {
    fn push_comma(&mut self) -> &mut Self {
        if self.first_bind {
            self.first_bind = false;
        } else {
            self.qb.push(',');
        }

        self
    }

    pub fn bind_tel(&mut self, tel: &'args Tel) -> &mut Self {
        self.push_comma().qb.push("tel = ").push_bind(tel);

        self
    }

    pub fn bind_class(&mut self, class: i16) -> &mut Self {
        self.push_comma().qb.push("class = ").push_bind(class);

        self
    }

    pub fn bind_class_no(&mut self, class_no: i16) -> &mut Self {
        self.push_comma().qb.push("class_no = ").push_bind(class_no);

        self
    }

    pub fn set_onboard(&mut self) -> &mut Self {
        self.push_comma().qb.push("is_onboarded = ").push_bind(true);

        self
    }

    pub async fn execute(&mut self, conn: &mut PgConnection) -> SqlxResult<User> {
        self.qb
            .push(" WHERE id = ")
            .push_bind(self.id)
            .push(
                " RETURNING id, role, email, name, tel, class, class_no, profile_url, is_onboarded",
            )
            .build_query_as()
            .fetch_one(conn)
            .await
    }
}
