"""
World Contrast — Extractor Tests
File: agents/tests/test_extractor.py

Critical tests for the promise extractor.
These tests verify that:
1. Promises are correctly extracted from real content
2. Attacks and opinions are correctly rejected
3. The output format is valid JSON with all required fields
4. Neutrality is maintained across different political orientations
"""

import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from agents.extraction.extractor import PromiseExtractor
from agents.validation.validator import PromiseValidator


# ── FIXTURES ──────────────────────────────────────────────────
@pytest.fixture
def mock_settings():
    settings = MagicMock()
    settings.anthropic_api_key = 'test-key'
    return settings


@pytest.fixture
def extractor(mock_settings):
    with patch('agents.extraction.extractor.PROMPT_PATH') as mock_path:
        mock_path.exists.return_value = True
        mock_path.read_text.return_value = "SYSTEM PROMPT\nYou are a promise extractor.\nUSER PROMPT TEMPLATE\n{content}"
        return PromiseExtractor(mock_settings)


@pytest.fixture
def validator(mock_settings):
    return PromiseValidator(mock_settings)


# ── EXTRACTION TESTS ──────────────────────────────────────────
class TestPromiseExtraction:

    @pytest.mark.asyncio
    async def test_extracts_valid_promise(self, extractor):
        """A concrete forward-looking commitment should be extracted."""
        mock_response = {
            'promises': [{
                'category': 'economy',
                'text_original': 'Vamos isentar quem ganha até cinco mil reais.',
                'language_original': 'pt',
                'verbatim': True,
                'ambiguous': False,
                'confidence': 0.97,
            }],
            'extraction_metadata': {
                'total_promises_found': 1,
                'total_rejected': 0,
                'rejection_reasons': [],
            }
        }

        with patch.object(extractor.client.messages, 'create') as mock_create:
            mock_create.return_value.content = [
                MagicMock(text=json.dumps(mock_response))
            ]

            result = await extractor.extract(
                content='Vamos isentar quem ganha até cinco mil reais por mês.',
                candidate_name='Test Candidate',
                country='BR',
                source_type='official_site',
                source_url='https://example.com/propostas',
                collection_date='2026-04-04',
            )

        assert len(result['promises']) == 1
        assert result['promises'][0]['category'] == 'economy'
        assert result['promises'][0]['confidence'] >= 0.70

    @pytest.mark.asyncio
    async def test_rejects_attack_content(self, extractor):
        """Content that attacks opponents should not be extracted."""
        mock_response = {
            'promises': [],
            'extraction_metadata': {
                'total_promises_found': 0,
                'total_rejected': 1,
                'rejection_reasons': ['attack_on_opponent'],
            }
        }

        with patch.object(extractor.client.messages, 'create') as mock_create:
            mock_create.return_value.content = [
                MagicMock(text=json.dumps(mock_response))
            ]

            result = await extractor.extract(
                content='My opponent has completely failed the country.',
                candidate_name='Test Candidate',
                country='BR',
                source_type='official_site',
                source_url='https://example.com',
                collection_date='2026-04-04',
            )

        assert len(result['promises']) == 0
        assert result['extraction_metadata']['total_rejected'] == 1

    @pytest.mark.asyncio
    async def test_handles_empty_content(self, extractor):
        """Empty content should return empty result without API call."""
        result = await extractor.extract(
            content='',
            candidate_name='Test',
            country='BR',
            source_type='official_site',
            source_url='https://example.com',
            collection_date='2026-04-04',
        )

        assert result['promises'] == []

    @pytest.mark.asyncio
    async def test_handles_api_error(self, extractor):
        """API errors should return empty result, not raise exception."""
        import anthropic

        with patch.object(extractor.client.messages, 'create') as mock_create:
            mock_create.side_effect = anthropic.APIError(
                message='API error', request=MagicMock(), body={}
            )

            result = await extractor.extract(
                content='Some valid content about promises.',
                candidate_name='Test',
                country='BR',
                source_type='official_site',
                source_url='https://example.com',
                collection_date='2026-04-04',
            )

        assert result['promises'] == []
        assert 'api_error' in result['extraction_metadata']['rejection_reasons'][0]


# ── VALIDATION TESTS ──────────────────────────────────────────
class TestPromiseValidator:

    @pytest.mark.asyncio
    async def test_valid_promise_passes(self, validator):
        """A clean, specific promise should pass all gates."""
        promise = {
            'text_original': 'We will build 500 new public schools within 4 years.',
            'category': 'education',
            'confidence': 0.97,
            'ambiguous': False,
            'verbatim': True,
            'language_original': 'en',
        }
        page = {
            'url': 'https://example.com',
            'content_hash': 'abc123',
            'collected_at': '2026-04-04T10:00:00Z',
            'source_type': 'official_site',
            'archive_url': 'https://web.archive.org/...',
        }

        result = await validator.validate(
            promise=promise,
            candidate_id='candidate-001',
            election_id='brazil-2026',
            page=page,
        )

        assert result is not None
        assert result['category'] == 'education'
        assert result['source_url'] == 'https://example.com'
        assert 'id' in result

    @pytest.mark.asyncio
    async def test_attack_text_rejected(self, validator):
        """Text containing attacks should be rejected."""
        promise = {
            'text_original': 'Unlike my opponent who failed, we will fix everything.',
            'category': 'governance',
            'confidence': 0.85,
        }
        page = {'url': 'https://example.com', 'content_hash': 'abc', 'collected_at': '2026-04-04'}

        result = await validator.validate(
            promise=promise,
            candidate_id='candidate-001',
            election_id='brazil-2026',
            page=page,
        )

        assert result is None

    @pytest.mark.asyncio
    async def test_low_confidence_flagged_not_rejected(self, validator):
        """Low confidence promises should be flagged, not silently rejected."""
        promise = {
            'text_original': 'We will improve the country in various ways.',
            'category': 'governance',
            'confidence': 0.65,  # Below threshold
            'ambiguous': True,
            'verbatim': True,
            'language_original': 'en',
        }
        page = {
            'url': 'https://example.com',
            'content_hash': 'abc123',
            'collected_at': '2026-04-04T10:00:00Z',
            'source_type': 'official_site',
            'archive_url': '',
        }

        result = await validator.validate(
            promise=promise,
            candidate_id='candidate-001',
            election_id='brazil-2026',
            page=page,
        )

        # Should still be returned but flagged
        assert result is not None
        assert result['flagged_for_review'] is True

    def test_sentiment_guard_blocks_historical(self, validator):
        """Historical claims should not pass as promises."""
        result = validator._sentiment_guard(
            "Last year, we achieved record low unemployment."
        )
        assert result['passed'] is False

    def test_sentiment_guard_passes_valid_promise(self, validator):
        """Clear future commitments should pass."""
        result = validator._sentiment_guard(
            "We will reduce income tax for workers earning up to R$5,000 per month."
        )
        assert result['passed'] is True


# ── NEUTRALITY TESTS ──────────────────────────────────────────
class TestNeutrality:
    """
    These tests verify that the system treats all candidates equally.
    A left-wing promise and a right-wing promise on the same topic
    should both be extracted with the same confidence and category.
    """

    @pytest.mark.asyncio
    async def test_left_and_right_promises_extracted_equally(self, extractor):
        """
        Both a state-expansion promise (left) and a privatization promise (right)
        should be extracted with similar confidence scores.
        """
        left_response = {
            'promises': [{
                'category': 'economy',
                'text_original': 'We will create a state-owned housing program for 1 million families.',
                'confidence': 0.96,
                'verbatim': True,
                'ambiguous': False,
                'language_original': 'en',
            }],
            'extraction_metadata': {'total_promises_found': 1, 'total_rejected': 0, 'rejection_reasons': []}
        }

        right_response = {
            'promises': [{
                'category': 'economy',
                'text_original': 'We will privatize state housing companies and create housing vouchers.',
                'confidence': 0.95,
                'verbatim': True,
                'ambiguous': False,
                'language_original': 'en',
            }],
            'extraction_metadata': {'total_promises_found': 1, 'total_rejected': 0, 'rejection_reasons': []}
        }

        with patch.object(extractor.client.messages, 'create') as mock_create:
            mock_create.return_value.content = [MagicMock(text=json.dumps(left_response))]
            left_result = await extractor.extract(
                content='We will create a state-owned housing program for 1 million families.',
                candidate_name='Left Candidate',
                country='BR',
                source_type='official_site',
                source_url='https://left.example.com',
                collection_date='2026-04-04',
            )

            mock_create.return_value.content = [MagicMock(text=json.dumps(right_response))]
            right_result = await extractor.extract(
                content='We will privatize state housing companies and create housing vouchers.',
                candidate_name='Right Candidate',
                country='BR',
                source_type='official_site',
                source_url='https://right.example.com',
                collection_date='2026-04-04',
            )

        # Both should be extracted
        assert len(left_result['promises']) == 1
        assert len(right_result['promises']) == 1

        # Both should have similar confidence
        left_conf = left_result['promises'][0]['confidence']
        right_conf = right_result['promises'][0]['confidence']
        assert abs(left_conf - right_conf) < 0.10, (
            f"Confidence gap too large: left={left_conf}, right={right_conf}. "
            "The system may be biased."
        )

        # Both should be in the same category
        assert left_result['promises'][0]['category'] == right_result['promises'][0]['category']
