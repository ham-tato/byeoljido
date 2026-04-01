export default function Privacy() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 text-text">
      <h1 className="text-2xl font-serif mb-2">개인정보처리방침</h1>
      <p className="text-sm text-text-muted mb-12">시행일: 2026년 4월 1일</p>

      <p className="text-sm text-text-muted leading-relaxed mb-10">
        숨숨(이하 "회사")은(는) 이용자의 개인정보를 중요하게 보호하며, 관련 법령에 따라 다음과 같이 개인정보를 처리합니다.
      </p>

      <Section title="1. 개인정보의 처리 목적">
        <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
        <ul>
          <li>서비스 제공 및 이용자 식별, 카카오 로그인 연동, 본인확인</li>
          <li>유료결제 처리, 결제내역 확인, 환불 처리, 고객문의 대응</li>
          <li>서비스 이용기록 분석, 부정이용 방지, 보안 및 안정성 확보</li>
          <li>(선택) 마케팅·광고성 정보 제공 및 이벤트 운영</li>
        </ul>
      </Section>

      <Section title="2. 처리하는 개인정보의 항목">
        <p>회사는 서비스 제공에 필요한 최소한의 개인정보를 처리합니다.</p>

        <p className="mt-3 font-medium text-text/80">카카오 로그인(외부계정 연동) 시</p>
        <ul>
          <li>(필수) 카카오 고유 식별자(회원번호/연동키 등)</li>
          <li>(선택) 닉네임(또는 표시명), 프로필 이미지, 이메일, 성별, 생일/출생연도 등 카카오 동의 화면에서 이용자가 선택 동의한 항목(제공되는 경우에 한함)</li>
        </ul>

        <p className="mt-3 font-medium text-text/80">유료결제 및 환불 처리 시</p>
        <ul>
          <li>(필수) 결제내역 정보(상품명, 결제금액, 결제일시, 결제수단, 거래번호, 승인번호 등)</li>
          <li>(필수) 환불 처리에 필요한 정보(결제수단별 환불 식별정보 등)</li>
          <li>회사는 원칙적으로 신용카드번호 등 결제수단의 민감한 인증정보를 직접 저장하지 않으며, 결제대행사(PG)가 처리할 수 있습니다.</li>
        </ul>

        <p className="mt-3 font-medium text-text/80">고객문의 및 분쟁처리</p>
        <ul>
          <li>(필수) 문의 내용, 연락처(이메일 또는 전화번호 중 이용자가 제공한 항목), 상담/처리 이력</li>
          <li>(선택) 이용자가 문의 과정에서 자발적으로 제공한 정보</li>
        </ul>

        <p className="mt-3 font-medium text-text/80">서비스 이용 과정에서 자동 생성·수집되는 정보</p>
        <ul>
          <li>(필수) 접속 로그, IP, 기기정보(브라우저/OS 등), 쿠키, 이용기록, 결제/열람 관련 기록, 부정이용 탐지 기록</li>
        </ul>
      </Section>

      <Section title="3. 개인정보의 처리 및 보유기간">
        <p>회사는 원칙적으로 개인정보 처리 목적이 달성되면 지체 없이 파기합니다. 다만, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관할 수 있습니다.</p>
        <ul>
          <li>서비스 이용(계정 연동) 정보: 회원 탈퇴(연동 해제) 시까지</li>
          <li>결제 및 거래내역: 관련 법령에 따른 보존기간 또는 분쟁 해결을 위한 필요기간 동안 보관</li>
          <li>고객문의/분쟁처리 기록: 처리 완료 후 관련 법령 또는 내부 기준에 따른 기간 보관</li>
          <li>마케팅 수신동의 정보(선택): 동의 철회 또는 회원 탈퇴 시까지</li>
        </ul>
      </Section>

      <Section title="4. 개인정보의 제3자 제공">
        <p>회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.</p>
        <ul>
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령에 특별한 규정이 있거나 수사·조사 목적 등 적법한 절차에 따라 요청이 있는 경우</li>
        </ul>
      </Section>

      <Section title="5. 개인정보 처리의 위탁">
        <p>회사는 서비스 제공을 위해 다음과 같은 업무를 외부에 위탁할 수 있으며, 위탁 시 수탁자가 개인정보를 안전하게 처리하도록 계약 등 필요한 조치를 합니다.</p>
        <ul>
          <li>결제 처리 및 환불: [PG사명 — 추후 기재]</li>
          <li>카카오 로그인 인증(외부계정): 카카오(주)</li>
          <li>클라우드/서버 호스팅: Supabase, Inc. / Cloudflare, Inc.</li>
          <li>고객지원 도구(문의/메일 발송 등): [업체명 — 추후 기재]</li>
        </ul>
      </Section>

      <Section title="6. 개인정보의 파기절차 및 방법">
        <ul>
          <li>파기절차: 목적 달성 후 별도 DB로 옮겨(해당 시) 내부 방침 및 법령에 따라 일정 기간 저장 후 파기합니다.</li>
          <li>파기방법: 전자적 파일은 복구 불가능한 방법으로 삭제하고, 출력물은 분쇄 또는 소각합니다.</li>
        </ul>
      </Section>

      <Section title="7. 이용자 및 법정대리인의 권리와 행사방법">
        <ul>
          <li>이용자는 회사에 대해 개인정보 열람, 정정·삭제, 처리정지, 동의철회 등을 요청할 수 있습니다.</li>
          <li>요청은 고객센터로 접수할 수 있으며, 회사는 본인확인 후 관련 법령에 따라 처리합니다.</li>
        </ul>
      </Section>

      <Section title="8. 개인정보의 안전성 확보조치">
        <p>회사는 개인정보의 안전성 확보를 위해 관리적·기술적·물리적 조치를 취합니다.</p>
      </Section>

      <Section title="9. 쿠키의 설치·운영 및 거부">
        <p>회사는 맞춤형 서비스 제공 및 이용분석을 위해 쿠키를 사용할 수 있습니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있으며, 일부 기능 이용에 제한이 있을 수 있습니다.</p>
      </Section>

      <Section title="10. 개인정보 보호책임자 및 문의처">
        <ul>
          <li>개인정보 보호책임자: 안경진</li>
          <li>연락처: [미기재 — 추후 등록 예정]</li>
          <li>고객센터: [미기재 — 추후 등록 예정]</li>
        </ul>
      </Section>

      <Section title="11. 개정 및 고지">
        <p>회사는 본 방침을 변경하는 경우 서비스 내 공지 등 합리적인 방법으로 고지합니다.</p>
      </Section>

      <section className="mt-12 pt-8 border-t border-border">
        <p className="text-sm text-text-muted">시행일: 2026년 4월 1일</p>
        <p className="text-sm text-text-muted mt-1">사업자: 숨숨 · 대표자: 안경진 · 사업자등록번호: 140-44-01387</p>
      </section>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-base font-sans font-bold text-text mb-3">{title}</h2>
      <div className="text-sm text-text-muted leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  )
}
