-- =============================================================================
-- 003_drop_oauth_social_login.sql
-- -----------------------------------------------------------------------------
-- 목적:
--   소셜 로그인(Google/Kakao/Naver OAuth) 기능을 앱에서 완전히 제거함에 따라,
--   더 이상 코드가 참조하지 않는 아래 스키마 잔재를 영구 제거한다.
--     (1) oauth_account 테이블            — 소셜 계정 연동 레코드(4행: kakao 1 / google 2 / naver 1)
--     (2) parent_user.auth_provider 컬럼   — 'local'/'google'/'kakao'/'naver' 인증 방식 표시
--
--   두 대상 모두 ORM 모델에서 선언이 제거되었으므로(OAuthAccount 모델 삭제,
--   ParentUser.auth_provider 컬럼 삭제), 1회 DROP 하면 create_all() 이 다시
--   만들지 않는다(영구 제거).
--
-- 작성일: 2026-07-15
--
-- 데이터 영향(중요 — 반드시 확인):
--   * oauth_account 4행(소셜 연동 링크)은 영구 삭제된다. 복구 불가.
--   * auth_provider='google' 인 2계정(gmail111 / ehdgus)은 password_hash 가
--     이미 존재하므로, 이 변경 후에도 아이디/비밀번호로 정상 로그인된다(잠금 아님).
--     auth_provider 컬럼 제거로 "가입 경로" 구분만 사라진다(전원 사실상 local).
--
-- 멱등성(idempotent):
--   * 존재 검증은 information_schema/to_regclass 로만 하고, 삭제 대상(oauth_account,
--     auth_provider)을 직접 참조하는 pre/post SELECT 는 두지 않는다. 따라서 이미
--     적용된 DB(또는 깨끗한 신규 DB)에서 다시 실행해도 "relation/column does not
--     exist" 없이 통과한다. DROP ... IF EXISTS 도 물론 멱등이다.
--
-- 최소 침습:
--   * parent_user 의 다른 컬럼/제약/인덱스는 건드리지 않는다(미언급).
--   * oauth_account 의 FK(fk_oauth_account_parent_id_parent_user)는 oauth_account
--     쪽에 걸린 제약이므로 DROP TABLE 시 함께 사라진다. parent_user 는 무영향.
--
-- 적용 방법(psql, pre/post 검증 결과·NOTICE 확인 후 커밋):
--   psql "$DATABASE_URL" -f backend/manual_sql/003_drop_oauth_social_login.sql
--
-- 되돌리는 법(스키마만 복구 — 데이터는 복구되지 않음):
--   ALTER TABLE parent_user
--     ADD COLUMN auth_provider varchar(16) NOT NULL DEFAULT 'local';
--   oauth_account 테이블/데이터는 이 파일로 복구되지 않는다(구 모델 DDL 필요).
--   되돌리려면 소셜 로그인 기능 자체를 되살려야 하므로 의도적으로만 수행할 것.
-- =============================================================================

BEGIN;

-- [pre] 적용 전 상태(존재 검증만 — 삭제 대상 테이블/컬럼을 직접 참조하지 않아 멱등):
--   oauth_table  = 1  → oauth_account 테이블 존재(제거 대상)
--   provider_col = 1  → parent_user.auth_provider 컬럼 존재(제거 대상)
SELECT
    (SELECT count(*) FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'oauth_account')      AS oauth_table,
    (SELECT count(*) FROM information_schema.columns
       WHERE table_name = 'parent_user' AND column_name = 'auth_provider')  AS provider_col;

-- [pre] 무엇이 삭제/변경되는지 NOTICE 로 출력(대상이 이미 없으면 안전하게 건너뜀).
DO $$
DECLARE
    n_rows int;
    rec    record;
BEGIN
    IF to_regclass('public.oauth_account') IS NULL THEN
        RAISE NOTICE '[pre] oauth_account 이미 없음 — 삭제할 행 없음(no-op)';
    ELSE
        EXECUTE 'SELECT count(*) FROM oauth_account' INTO n_rows;
        RAISE NOTICE '[pre] 영구 삭제될 oauth_account 행 수: %', n_rows;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'parent_user' AND column_name = 'auth_provider') THEN
        RAISE NOTICE '[pre] 곧 사라질 auth_provider(가입 경로) 분포:';
        FOR rec IN EXECUTE
            'SELECT auth_provider AS p, count(*) AS c FROM parent_user GROUP BY auth_provider ORDER BY auth_provider'
        LOOP
            RAISE NOTICE '    % = %', rec.p, rec.c;
        END LOOP;
    ELSE
        RAISE NOTICE '[pre] auth_provider 컬럼 이미 없음(no-op)';
    END IF;
END $$;

-- 멱등 DROP: 이미 제거된 환경(신규 DB 등)에서도 에러 없이 통과한다.
DROP TABLE IF EXISTS oauth_account;
ALTER TABLE parent_user DROP COLUMN IF EXISTS auth_provider;

-- [post] 적용 후 상태:
--   oauth_table  = 0  → oauth_account 테이블 제거됨(성공)
--   provider_col = 0  → auth_provider 컬럼 제거됨(성공)
SELECT
    (SELECT count(*) FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'oauth_account')      AS oauth_table,
    (SELECT count(*) FROM information_schema.columns
       WHERE table_name = 'parent_user' AND column_name = 'auth_provider')  AS provider_col;

-- post 의 oauth_table=0, provider_col=0 을 확인한 뒤 커밋한다.
-- 결과가 기대와 다르거나 의심스러우면 COMMIT 대신 ROLLBACK 하라:
--   ROLLBACK;
COMMIT;

-- =============================================================================
-- NEEDS SENIOR REVIEW
--   스키마 파괴적 변경(테이블/컬럼 DROP) + 데이터 삭제(oauth_account 4행)를 포함한다.
--   반드시 사람이 pre/post SELECT·NOTICE 결과를 확인하고 수동 실행할 것. 자동 적용 금지.
-- =============================================================================
