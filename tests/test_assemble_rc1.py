import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('assembler', Path(__file__).parents[1] / 'scripts/assemble_rc1.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
ENV = {'GITHUB_REPOSITORY': module.REPO, 'GITHUB_EVENT_NAME': 'workflow_dispatch', 'GITHUB_REF': 'refs/heads/main'}


class AssemblySafetyTest(unittest.TestCase):
    def test_rejects_other_repository_trigger_or_branch_before_network(self):
        for key, value in [('GITHUB_REPOSITORY', 'other/repo'), ('GITHUB_EVENT_NAME', 'push'), ('GITHUB_REF', 'refs/heads/other')]:
            with self.subTest(key=key), patch.dict(module.os.environ, ENV | {key: value}), patch.object(module, 'gh') as gh:
                with self.assertRaises(RuntimeError):
                    module.main()
                gh.assert_not_called()

    def test_existing_conflict_never_uploads_or_deletes(self):
        with patch.dict(module.os.environ, ENV), patch.object(module, 'release', return_value={'assets': [{'name': module.NAMES[1]}]}), patch.object(module, 'public_download', side_effect=RuntimeError('SHA mismatch')), patch.object(module, 'gh') as gh:
            with self.assertRaisesRegex(RuntimeError, 'SHA mismatch'):
                module.main()
            gh.assert_not_called()

    def test_completed_assets_are_only_reverified(self):
        assets = {'assets': [{'name': name} for name in module.NAMES]}
        with patch.dict(module.os.environ, ENV), patch.object(module, 'release', return_value=assets), patch.object(module, 'public_download') as download, patch.object(module, 'gh') as gh:
            module.main()
            self.assertEqual(download.call_count, 6)
            gh.assert_not_called()

    def test_missing_part_fails_before_upload(self):
        with patch.dict(module.os.environ, ENV), patch.object(module, 'release', return_value={'assets': []}), patch.object(module, 'gh') as gh:
            with self.assertRaisesRegex(RuntimeError, 'part missing'):
                module.main()
            gh.assert_not_called()

    def test_corrupt_part_fails_before_upload(self):
        name = 'rc1-982db20c.part-000'
        def fake_gh(*args):
            self.assertEqual(args[:2], ('release', 'download'))
            (Path(args[-1]) / name).write_bytes(b'corrupt')
            return ''
        with patch.dict(module.os.environ, ENV), patch.object(module, 'release', return_value={'assets': [{'name': name}]}), patch.object(module, 'gh', side_effect=fake_gh):
            with self.assertRaisesRegex(RuntimeError, 'part integrity mismatch'):
                module.main()


if __name__ == '__main__':
    unittest.main()
