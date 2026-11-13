// Only the site's AI access password is sent here. The OpenAI key stays on the server.
export async function requestAI<T>(payload: Record<string, unknown>): Promise<T> {
    const send = (password: string) => fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-AI-Access-Password': password },
        body: JSON.stringify(payload),
    });
    let password = sessionStorage.getItem('ai-access-password') || '';
    let response = await send(password);
    if (response.status === 401) {
        sessionStorage.removeItem('ai-access-password');
        const entered = window.prompt('AI 기능 이용 암호를 입력해 주세요. (OpenAI API 키가 아닙니다.)');
        if (!entered) throw new Error('AI 기능을 이용하려면 이용 암호가 필요합니다.');
        password = entered;
        response = await send(password);
        if (response.ok) sessionStorage.setItem('ai-access-password', password);
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'AI 요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    return result.result as T;
}
