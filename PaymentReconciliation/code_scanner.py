#!/usr/bin/env python3
"""
Code Quality Scanner
Scans for: JWT issues, duplicate code, dummy code, and unused code
"""

import os
import re
import ast
import hashlib
from collections import defaultdict
from pathlib import Path
import json

class CodeScanner:
    def __init__(self, project_path):
        self.project_path = Path(project_path)
        self.issues = {
            'jwt_issues': [],
            'duplicate_code': [],
            'dummy_code': [],
            'unused_code': []
        }
        
    def scan_all(self):
        """Run all scans on the project"""
        print("🔍 Starting code scan...")
        print(f"📁 Project path: {self.project_path}\n")
        
        for root, dirs, files in os.walk(self.project_path):
            # Skip common directories
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__', 'venv', 'env', '.venv', 'dist', 'build']]
            
            for file in files:
                file_path = Path(root) / file
                
                # Skip non-code files
                if file.endswith(('.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cs', '.go')):
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            relative_path = file_path.relative_to(self.project_path)
                            
                            self.check_jwt_issues(content, relative_path)
                            self.check_dummy_code(content, relative_path)
                            self.check_duplicate_code(content, relative_path)
                            
                            if file.endswith('.py'):
                                self.check_unused_python_code(content, relative_path)
                    except Exception as e:
                        print(f"⚠️  Error scanning {file_path}: {e}")
        
        self.print_results()
        self.save_results()
        
    def check_jwt_issues(self, content, file_path):
        """Check for JWT security issues"""
        issues_found = []
        
        # Check for weak/hardcoded JWT secrets
        weak_secrets = [
            r'["\']secret["\']',
            r'jwt\.encode\([^,]+,\s*["\'][^"\']{1,10}["\']',
            r'JWT_SECRET\s*=\s*["\'][^"\']{1,10}["\']',
            r'secret\s*=\s*["\'](?:secret|123|password|test)["\']',
        ]
        
        for pattern in weak_secrets:
            if re.search(pattern, content, re.IGNORECASE):
                issues_found.append({
                    'file': str(file_path),
                    'issue': 'Weak or hardcoded JWT secret detected',
                    'pattern': pattern,
                    'severity': 'HIGH'
                })
        
        # Check for missing JWT verification
        if 'jwt.decode' in content.lower():
            if not re.search(r'verify[_=]\s*True', content, re.IGNORECASE):
                if 'verify' in content.lower() and 'false' in content.lower():
                    issues_found.append({
                        'file': str(file_path),
                        'issue': 'JWT verification disabled (verify=False)',
                        'severity': 'CRITICAL'
                    })
        
        # Check for missing algorithm specification
        if 'jwt' in content.lower():
            if re.search(r'algorithm\s*=\s*["\']none["\']', content, re.IGNORECASE):
                issues_found.append({
                    'file': str(file_path),
                    'issue': 'JWT algorithm set to "none" - security risk',
                    'severity': 'CRITICAL'
                })
            
            if 'decode' in content and not re.search(r'algorithm[s]?\s*=', content, re.IGNORECASE):
                issues_found.append({
                    'file': str(file_path),
                    'issue': 'JWT decode without explicit algorithm specification',
                    'severity': 'MEDIUM'
                })
        
        # Check for JWT in logs or print statements
        if re.search(r'(?:print|log|console\.log|logger)\s*\([^)]*jwt[^)]*\)', content, re.IGNORECASE):
            issues_found.append({
                'file': str(file_path),
                'issue': 'JWT token may be logged or printed',
                'severity': 'HIGH'
            })
        
        self.issues['jwt_issues'].extend(issues_found)
    
    def check_dummy_code(self, content, file_path):
        """Check for dummy/placeholder code"""
        issues_found = []
        
        # TODO, FIXME, HACK, XXX comments
        todo_patterns = [
            (r'#\s*TODO', 'TODO comment found'),
            (r'#\s*FIXME', 'FIXME comment found'),
            (r'#\s*HACK', 'HACK comment found'),
            (r'#\s*XXX', 'XXX comment found'),
            (r'//\s*TODO', 'TODO comment found'),
            (r'//\s*FIXME', 'FIXME comment found'),
            (r'/\*\s*TODO', 'TODO comment found'),
        ]
        
        for pattern, message in todo_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                line_num = content[:match.start()].count('\n') + 1
                issues_found.append({
                    'file': str(file_path),
                    'line': line_num,
                    'issue': message,
                    'severity': 'LOW'
                })
        
        # Hardcoded credentials/data
        hardcoded_patterns = [
            (r'password\s*=\s*["\'][^"\']+["\']', 'Hardcoded password'),
            (r'api[_-]?key\s*=\s*["\'][^"\']+["\']', 'Hardcoded API key'),
            (r'token\s*=\s*["\'][a-zA-Z0-9]{20,}["\']', 'Hardcoded token'),
            (r'localhost:\d+', 'Hardcoded localhost URL'),
            (r'127\.0\.0\.1', 'Hardcoded localhost IP'),
        ]
        
        for pattern, message in hardcoded_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                line_num = content[:match.start()].count('\n') + 1
                issues_found.append({
                    'file': str(file_path),
                    'line': line_num,
                    'issue': message,
                    'severity': 'MEDIUM'
                })
        
        # Test/dummy data
        if re.search(r'(?:test|dummy|fake|mock)(?:_)?(?:user|data|value)', content, re.IGNORECASE):
            issues_found.append({
                'file': str(file_path),
                'issue': 'Test/dummy data references found',
                'severity': 'LOW'
            })
        
        # Disabled/commented code blocks (more than 3 consecutive commented lines)
        commented_lines = re.findall(r'(?:^\s*#[^\n]*\n){4,}', content, re.MULTILINE)
        if commented_lines:
            issues_found.append({
                'file': str(file_path),
                'issue': f'Large commented code blocks found ({len(commented_lines)} blocks)',
                'severity': 'LOW'
            })
        
        self.issues['dummy_code'].extend(issues_found)
    
    def check_duplicate_code(self, content, file_path):
        """Check for duplicate code blocks"""
        # Simple duplicate detection using line hashing
        lines = content.split('\n')
        line_hashes = defaultdict(list)
        
        # Check for duplicate blocks of 5+ lines
        block_size = 5
        for i in range(len(lines) - block_size):
            block = '\n'.join(lines[i:i+block_size])
            # Skip blocks that are mostly whitespace or comments
            if len(block.strip()) < 20:
                continue
            if block.strip().startswith('#') or block.strip().startswith('//'):
                continue
                
            block_hash = hashlib.md5(block.encode()).hexdigest()
            line_hashes[block_hash].append({
                'file': str(file_path),
                'start_line': i + 1,
                'block': block[:100] + '...' if len(block) > 100 else block
            })
        
        # Report duplicates
        for block_hash, occurrences in line_hashes.items():
            if len(occurrences) > 1:
                self.issues['duplicate_code'].append({
                    'locations': occurrences,
                    'severity': 'MEDIUM'
                })
    
    def check_unused_python_code(self, content, file_path):
        """Check for unused imports and variables in Python files"""
        try:
            tree = ast.parse(content)
            imports = set()
            used_names = set()
            defined_functions = set()
            called_functions = set()
            
            for node in ast.walk(tree):
                # Collect imports
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.add(alias.name.split('.')[0])
                elif isinstance(node, ast.ImportFrom):
                    for alias in node.names:
                        imports.add(alias.name)
                
                # Collect used names
                elif isinstance(node, ast.Name):
                    used_names.add(node.id)
                
                # Collect function definitions
                elif isinstance(node, ast.FunctionDef):
                    defined_functions.add(node.name)
                
                # Collect function calls
                elif isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Name):
                        called_functions.add(node.func.id)
            
            # Find unused imports
            unused_imports = imports - used_names
            if unused_imports:
                self.issues['unused_code'].append({
                    'file': str(file_path),
                    'issue': f'Unused imports: {", ".join(sorted(unused_imports))}',
                    'severity': 'LOW'
                })
            
            # Find unused functions (excluding special methods and main)
            unused_functions = defined_functions - called_functions
            unused_functions = {f for f in unused_functions if not f.startswith('_') and f != 'main'}
            if unused_functions:
                self.issues['unused_code'].append({
                    'file': str(file_path),
                    'issue': f'Potentially unused functions: {", ".join(sorted(unused_functions))}',
                    'severity': 'LOW'
                })
                
        except SyntaxError:
            pass  # Skip files with syntax errors
    
    def print_results(self):
        """Print scan results to console"""
        print("\n" + "="*80)
        print("📊 SCAN RESULTS")
        print("="*80 + "\n")
        
        # JWT Issues
        print(f"🔐 JWT ISSUES: {len(self.issues['jwt_issues'])} found")
        if self.issues['jwt_issues']:
            for issue in self.issues['jwt_issues']:
                print(f"  [{issue.get('severity', 'UNKNOWN')}] {issue['file']}")
                print(f"      → {issue['issue']}")
        print()
        
        # Dummy Code
        print(f"🧪 DUMMY/PLACEHOLDER CODE: {len(self.issues['dummy_code'])} issues found")
        if self.issues['dummy_code']:
            # Group by file
            by_file = defaultdict(list)
            for issue in self.issues['dummy_code']:
                by_file[issue['file']].append(issue)
            
            for file, file_issues in list(by_file.items())[:10]:  # Show first 10 files
                print(f"  📄 {file}: {len(file_issues)} issues")
                for issue in file_issues[:3]:  # Show first 3 issues per file
                    line_info = f"Line {issue['line']}: " if 'line' in issue else ""
                    print(f"      → {line_info}{issue['issue']}")
            
            if len(by_file) > 10:
                print(f"  ... and {len(by_file) - 10} more files")
        print()
        
        # Duplicate Code
        print(f"📋 DUPLICATE CODE: {len(self.issues['duplicate_code'])} duplicate blocks found")
        if self.issues['duplicate_code']:
            for i, dup in enumerate(self.issues['duplicate_code'][:5], 1):  # Show first 5
                print(f"  Block {i}: Found in {len(dup['locations'])} locations")
                for loc in dup['locations'][:2]:
                    print(f"      → {loc['file']} (line {loc['start_line']})")
            
            if len(self.issues['duplicate_code']) > 5:
                print(f"  ... and {len(self.issues['duplicate_code']) - 5} more duplicates")
        print()
        
        # Unused Code
        print(f"🗑️  UNUSED CODE: {len(self.issues['unused_code'])} issues found")
        if self.issues['unused_code']:
            for issue in self.issues['unused_code'][:10]:  # Show first 10
                print(f"  📄 {issue['file']}")
                print(f"      → {issue['issue']}")
            
            if len(self.issues['unused_code']) > 10:
                print(f"  ... and {len(self.issues['unused_code']) - 10} more issues")
        print()
        
        print("="*80)
        print(f"✅ Scan complete! Total issues: {sum(len(v) for v in self.issues.values())}")
        print("="*80)
    
    def save_results(self):
        """Save results to a JSON file"""
        output_file = self.project_path / 'code_scan_results.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.issues, f, indent=2)
        print(f"\n💾 Detailed results saved to: {output_file}")


if __name__ == "__main__":
    project_path = Path(__file__).parent
    scanner = CodeScanner(project_path)
    scanner.scan_all()
