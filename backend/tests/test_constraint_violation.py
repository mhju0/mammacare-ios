"""Unit test for the shared IntegrityError constraint-name matcher.

Pins the three ways a constraint match is detected — orig.constraint_name,
orig.__cause__.constraint_name, and the exception-text substring fallback — plus
the str-vs-tuple name argument. This logic used to be copy-pasted in three
modules; consolidating it means the behavior is pinned once here.
"""
from sqlalchemy.exc import IntegrityError

from app.db.constraints import is_constraint_violation


class _FakeCause:
    def __init__(self, constraint_name):
        self.constraint_name = constraint_name


class _FakeOrig:
    def __init__(self, constraint_name=None, cause_constraint=None):
        if constraint_name is not None:
            self.constraint_name = constraint_name
        self.__cause__ = _FakeCause(cause_constraint) if cause_constraint else None


def _exc(orig, statement="INSERT INTO t VALUES (1)"):
    return IntegrityError(statement, {}, orig)


def test_matches_on_orig_constraint_name():
    exc = _exc(_FakeOrig(constraint_name="ex_ingredient_testing_no_overlap"))
    assert is_constraint_violation(exc, "ex_ingredient_testing_no_overlap") is True
    # tuple form: match on any listed name
    assert is_constraint_violation(exc, ("ux_other", "ex_ingredient_testing_no_overlap")) is True


def test_matches_on_cause_constraint_name():
    # asyncpg often carries the name on orig.__cause__, not orig
    exc = _exc(_FakeOrig(cause_constraint="ux_notification_parent_type_dedup_key"))
    assert is_constraint_violation(exc, "ux_notification_parent_type_dedup_key") is True


def test_matches_on_exception_text_fallback():
    # no constraint_name attributes anywhere — fall back to the exception string
    exc = _exc(_FakeOrig(), statement="duplicate key value violates ux_notification_parent_type_dedup_key")
    assert is_constraint_violation(exc, "ux_notification_parent_type_dedup_key") is True


def test_no_match_returns_false():
    exc = _exc(_FakeOrig(constraint_name="ex_something_else"), statement="INSERT INTO t VALUES (1)")
    assert is_constraint_violation(exc, "ex_target") is False
    assert is_constraint_violation(exc, ("ex_target", "ux_other")) is False
