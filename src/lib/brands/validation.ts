export function isValidUrl(string: string): boolean {
  if (!string.trim()) {
    return true;
  }

  try {
    const url = new URL(string);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidDomain(domain: string): boolean {
  if (!domain.trim()) {
    return true;
  }

  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;

  return domainRegex.test(domain.trim());
}

export function validateBrandName(name: string): string | undefined {
  if (!name.trim()) {
    return "品牌名称为必填项，请填写后再保存。";
  }

  if (name.trim().length > 100) {
    return "品牌名称不能超过 100 个字符。";
  }

  return undefined;
}

export function validateDomain(domain: string): string | undefined {
  if (!domain.trim()) {
    return undefined;
  }

  if (!isValidDomain(domain)) {
    return "域名格式不正确，请输入有效的域名，如 example.com。";
  }

  return undefined;
}

export function validateLogoUrl(url: string): string | undefined {
  if (!url.trim()) {
    return undefined;
  }

  if (!isValidUrl(url)) {
    return "Logo URL 格式不正确，请输入有效的 HTTP/HTTPS URL。";
  }

  return undefined;
}

export function validateKeyword(keyword: string, existingKeywords: string[]): string | undefined {
  const trimmed = keyword.trim();

  if (!trimmed) {
    return undefined;
  }

  if (existingKeywords.includes(trimmed)) {
    return `关键词 "${trimmed}" 已存在，请勿重复添加。`;
  }

  if (trimmed.length > 50) {
    return "单个关键词不能超过 50 个字符。";
  }

  if (existingKeywords.length >= 20) {
    return "关键词数量已达上限（20个），请删除部分关键词后再添加。";
  }

  return undefined;
}
