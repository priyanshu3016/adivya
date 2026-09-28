"""
Canonical deficiency codes, severity levels, and check types.
These match PostgreSQL database CHECK constraints in backend/app/db/models.py exactly.
"""
from enum import Enum


class DeficiencyType(str, Enum):
    """
    Deficiency types mirroring the check constraint:
    ck_deficiencies_type: deficiency_type IN (
        'missing_document', 'data_mismatch', 'name_mismatch', 'invalid_data', 'expired_document'
    )
    """
    MISSING_DOCUMENT = "missing_document"
    DATA_MISMATCH = "data_mismatch"
    NAME_MISMATCH = "name_mismatch"
    INVALID_DATA = "invalid_data"
    EXPIRED_DOCUMENT = "expired_document"


class Severity(str, Enum):
    """
    Deficiency severities mirroring the check constraint:
    ck_deficiencies_severity: severity IN ('critical', 'warning', 'info')
    """
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"


class CheckType(str, Enum):
    """
    Verification check types mirroring the check constraint:
    ck_verification_results_type: check_type IN ('eligibility', 'document', 'cross_field')
    """
    ELIGIBILITY = "eligibility"
    DOCUMENT = "document"
    CROSS_FIELD = "cross_field"


class CheckResult(str, Enum):
    """
    Verification check outcomes mirroring the check constraint:
    ck_verification_results_result: result IN ('pass', 'fail', 'warning')
    """
    PASS = "pass"
    FAIL = "fail"
    WARNING = "warning"
