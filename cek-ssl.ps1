<#
    cek-ssl.ps1 - Diagnosa HTTPS untuk wafiarifin.my.id (GitHub Pages)

    Cara pakai (Windows PowerShell):
        powershell -ExecutionPolicy Bypass -File .\cek-ssl.ps1

    Skrip ini hanya MEMBACA. Tidak mengubah apa pun.
#>

param(
    [string]$Domain = "wafiarifin.my.id",
    [string]$Repo   = "wafiarifin.github.io"
)

$ErrorActionPreference = 'SilentlyContinue'
$githubPagesIPs = @('185.199.108.153','185.199.109.153','185.199.110.153','185.199.111.153')

function Section($t) { ""; "=== $t ===" }

# ---------------------------------------------------------------- 1. DNS
Section "1. DNS A record untuk $Domain"
$ips = @()
try { $ips = (Resolve-DnsName $Domain -Type A -ErrorAction Stop | Where-Object { $_.IPAddress }).IPAddress } catch {}
if ($ips) { $ips | ForEach-Object { "  A      $_" } } else { "  (tidak ada A record)" }

$missing = $githubPagesIPs | Where-Object { $ips -notcontains $_ }
$extra   = $ips | Where-Object { $githubPagesIPs -notcontains $_ }
if (-not $missing -and -not $extra) {
    "  OK: persis 4 IP GitHub Pages, tidak ada yang nyasar."
} else {
    if ($missing) { "  PERINGATAN: IP GitHub yang belum dipasang -> $($missing -join ', ')" }
    if ($extra)   { "  PERINGATAN: IP asing (bisa bikin sertifikat gagal) -> $($extra -join ', ')" }
}

Section "1b. DNS www.$Domain"
try {
    Resolve-DnsName "www.$Domain" -ErrorAction Stop |
        ForEach-Object { "  $($_.Type)  $($_.NameHost)$($_.IPAddress)" }
} catch { "  (tidak ada record www)" }

Section "1c. CAA record (kalau ada dan tidak izinkan letsencrypt, sertifikat PASTI gagal)"
foreach ($n in @($Domain, ($Domain -replace '^[^.]+\.',''))) {
    try {
        $caa = Resolve-DnsName $n -Type ANY -ErrorAction Stop | Where-Object { $_.Type -eq 257 }
        if ($caa) { $caa | ForEach-Object { "  $n -> $($_.Strings -join ' ')" } } else { "  $n -> tidak ada CAA (aman)" }
    } catch { "  $n -> tidak ada CAA (aman)" }
}

# ------------------------------------------------------- 2. Sertifikat TLS
Section "2. Sertifikat TLS yang disajikan server"
$certOk = $false
$san = @()
try {
    $tcp = New-Object System.Net.Sockets.TcpClient($Domain, 443)
    $policyErrors = $null
    $cb = [System.Net.Security.RemoteCertificateValidationCallback]{
        param($s, $c, $ch, $e) $script:policyErrors = $e; return $true
    }
    $ssl = New-Object System.Net.Security.SslStream($tcp.GetStream(), $false, $cb)
    $ssl.AuthenticateAsClient($Domain)
    $c2 = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($ssl.RemoteCertificate)
    "  Subject   : $($c2.Subject)"
    "  Issuer    : $($c2.Issuer)"
    "  Berlaku   : $($c2.NotBefore.ToString('yyyy-MM-dd')) s/d $($c2.NotAfter.ToString('yyyy-MM-dd'))"
    $sanExt = $c2.Extensions | Where-Object { $_.Oid.Value -eq '2.5.29.17' }
    if ($sanExt) {
        $san = ($sanExt.Format($false) -split ',') | ForEach-Object { $_.Trim() -replace '^DNS Name=','' }
        "  SAN       : $($san -join ', ')"
    }
    $ssl.Close(); $tcp.Close()

    $match = $false
    foreach ($n in $san) {
        if ($n -eq $Domain) { $match = $true }
        elseif ($n -like '*.*' -and $Domain -like ($n -replace '^\*','')) { $match = $true }
    }
    if ($match) { $certOk = $true; "  COCOK     : ya, sertifikat berlaku untuk $Domain" }
    else        { "  COCOK     : TIDAK. Sertifikat ini tidak mencakup $Domain" }
} catch {
    "  GAGAL konek TLS: $($_.Exception.Message)"
}

# ------------------------------------------- 3. Redirect HTTP -> HTTPS
Section "3. Redirect HTTP -> HTTPS (tanda 'Enforce HTTPS' aktif)"
try {
    $r = Invoke-WebRequest -Uri "http://$Domain/" -MaximumRedirection 0 -ErrorAction Stop
    "  HTTP $($r.StatusCode) - TIDAK redirect ke HTTPS"
    "  Berarti 'Enforce HTTPS' di GitHub masih NONAKTIF."
} catch {
    $resp = $_.Exception.Response
    if ($resp) {
        $code = [int]$resp.StatusCode
        $loc  = $resp.Headers['Location']
        if ($code -in 301,302,307,308 -and $loc -like 'https://*') {
            "  OK: HTTP $code -> $loc"
        } else {
            "  HTTP $code (Location: $loc)"
        }
    } else { "  Gagal tes: $($_.Exception.Message)" }
}

# --------------------------------------------------------- 4. Kesimpulan
Section "KESIMPULAN"
if ($certOk) {
    "  Sertifikat SUDAH benar. Kalau browser masih bilang 'Not Secure',"
    "  bersihkan cache browser atau coba mode incognito."
} else {
    "  MASALAH DITEMUKAN: GitHub Pages belum menerbitkan sertifikat"
    "  Let's Encrypt untuk $Domain."
    ""
    "  Server masih menyajikan sertifikat bawaan '$($san -join ', ')' yang"
    "  tidak mencakup domain Anda. Karena itu browser menandainya Not Secure."
    ""
    "  Perbaikan (di GitHub, bukan di repo ini):"
    "    1. Buka https://github.com/wafiarifin/Profil-Wafi/settings/pages"
    "    2. Di bagian Custom domain, klik Remove / kosongkan, lalu Save."
    "    3. Isi lagi 'wafiarifin.my.id', lalu Save (ini memicu ulang penerbitan sertifikat)."
    "    4. Tunggu 15 menit - 24 jam. Cek ulang dengan skrip ini."
    "    5. Setelah sertifikat terbit, centang 'Enforce HTTPS', lalu Save."
    ""
    "  Cek status 'Enforce HTTPS' masih abu-abu/tidak bisa dicentang = sertifikat belum siap."
}
""
