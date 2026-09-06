import bcrypt from 'bcryptjs';

const secret = process.env.OWNER_SECRET_INPUT;
if (!secret) {
  console.error('Set OWNER_SECRET_INPUT to your owner verification secret, then run: npx tsx scripts/hash-owner-secret.ts');
  process.exit(1);
}
if (secret.length < 8) {
  console.error('Owner verification secret must be at least 8 characters.');
  process.exit(1);
}

const hash = bcrypt.hashSync(secret, 12);
console.log(hash);