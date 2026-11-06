const ECOSYSTEM_CIRCLE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAKAAAABgCAYAAACaJ3mZAAAX8ElEQVR42u2debBdVZ3vP9+1z3TH3MwJJIwBERGh8cGjsR3apwwRTYKozEq1XQiIjYDd9rNela9e9SsFHEAftPqEZlAZlRlUWunX2Ei9JwIqyBQCScic3Nx7z71n2Ov7/tgnGBBuzklCJva36lTdOnfvfdZe67t/8/ptyJEjR44cOXLkyJEjR44cOXLkyJEjR44cOXLkyJEjR44cOXLkyJEjR44cOXLkyJEjR44cOXLkyJEjR44cOXLkyJEjR44cOXLkyJEjR44cOXLkyJEjR44cgPIp2Hy8/dx/oV4qqjJW60rFLMw0oCIcwamlFFQXjBmPyVSBYeOGRKOYuGmIj1z2NzkBc3RIvnOuJsghRuYg/tKwG6YsCGADtjDIgtQQZaeGBjAiMQisxayxvAaxOtjVNKk3qJUcrvwbHldOwF0aPvvsbA6kEtIAdjfQIE3XkSRVIOrb3/6z8w48+yoaliqKBwFHW+pXRrrXnlI7+14bzbvBGEG0GBOMAqsMS7FeCmKZCEONQikmsenHLz8tJ+AuQbpzzoHRUdHb20WzOQPYC9gTaSJQBCL2ENIfCeG3rFy5llmz0CWXvHyNg87+PuCZoBMFU5AMeLPn362/xQYa1yTWA0sNC7FfLBDX1GultH/yIA999bM5AXcq0n3xi7BiBVQqRezpwH5I+wJTsbs2PjSbFan19yLse2k2l9LTg77+dd559neYxRo9w7QPgv5SG1Noq62JMUgI41RmEFiC9BRiUcGNQVL8yJV/u9OvTWGXJt6550KhIAYHe6lU9sY+EJiN1Iudkey1pZexhbQX0tEUCrdSrw8C1CjyLNO7BbMzmUXc2sPeIAxbYjEgJmFPAt6KWdV04WkFP3Hwed9fhmk+dvmZuQTc4dQsCHsAeAtwENLMloo1tpHam5/s2PtZuPD/cMghHDw4B2AScJqtSdJWlX6bujPZqPWbw6BnZR4n8oJE7dErPpUTcLsS76yzIEZRLA4AB2EfTGajJS0idU4WOyAtRLoBqB7swwAmAqfanqLNueaW3ucGQyFbv1Hwc4LfKLAoCdR/c9mZOQG36YJ85jPQ3Q21Wi/2QdiHIk0Dko3UqzdztYW0DrgGWH2wDwNTQXwMac4boII3Y/0so1HgacHDRC+GEB+/4pM5Ad9wVVsqQZqWaDbnAIcj7dGybc3WcQ4EDAH/Aqx8bziQZ5uTmBhGjzL8F6GwlZ2QzRujjTPnaR3mAdfLvyU4/f13Ttmh1zDstOT73Oegr0/U69NJ0+OQ5gH7tKRe3GqkyJyVEaAO8MDl5zAxjILi72ReaP1/ez/IRnLLfR4Qfn8oje3f213nbZ/5fk7ArT7bZ58N9XqZoaHDgI9hHwqUkSJbPSQCwFJCGN7guHSVy4yONgYlfga8aBubsAOQ0YgI9IKOrDbUG0LICbjVZvfTn8YXXgjSVKS52McAU1vEeCPUoID12I+Rpqm+9S0AHv7aKZSKJR77bViCfKvEryRWWKr5z8fRIqWDcTAE28G8MWQVYGHETPCs7W8d7CI2oM89FyAhxrcA70GagQ1vjBe6gRyj2L8ghIexXzMtd/gXrgIrjI56gs0EcEkoASXIJUwF6AL32fQLupG6MT1AASFvdB/aCozJrmYBPzXpvyehj0e/9Ykdcl13+EC0582DWbOgXq9QKByOdCR2z2aHVcZ/EFt5DTeRViA9RJL8jhhfk3wAD3/1U7RszrWtzyvwF+fcgIRqHlYxRTFxVyTpA/oRUwy7IabKngCqWAT9KXvszbwZGwVwMaibZhzMJeBmS71GA5JkAHgv8HakwlZ2MDbMQx0YRFqEvQjpeaZNW8/QkDfOA28tHHz+9STlsurDwyHI3aSehtgdsxcwA+gGBYsNg3QHIlDORODdaYOHZx+ScN/ZZ+QE7Di219cHw8PTgQ8AczbK0W4taRdbNt5C4BnsF5GGWLs2ZcoUdPnl2+x+33HWd0BS6lBCTJO0N7AfYrpNJct+tG3rCnsY+CGw+PH/dWYuATsi34UXwsUXi3PP3QP7aKTd6VQKvP7CCGgCy5H+gPQUsBqpuS0JtykyKkZRLHSnJLOd5YD3leh7pan32vfo7B7/n6y7gcbjrRRdcsL3KLsrSUMsggMKMRIalWtPivXz7nHtO8flBPQFF8AnPiGuvnqflpc7fQvKnV7tVDSxFwOPEsLThDCE7R2FeK/Ge79yFcufDRTLFJx6BooH27xVot9/KljQy4Q0ItPYi2Rus7wq1Lv4w0gdiEloFHbHOhCYBe4C1QzLCHrSpAslGvUbz3jzEtAXXZSVTfX1zcE+DnvKFpEvS6MJO0VaCvwG+48kyTDNJrriip0mBPW2c74LkIhkhuBQ4K1A74ayCkvG1IWfQn6gXmisqDTLPLmyBFAixv+EfSSo327Rt1X05awY9hEX4r+FVNXazae/SQmYVSjPAE7YYsmXkY+WZ/ob4FGazUG6utA3vsHOired+z3KTQqNQpiB2dtmqiBp5aufx3pBoV5zs5dnVplSEsJYMz3C+P3YpYyrG0cP3HJaiKBHKBR+plpztPZX+8AFR715COjzz8/ifPX6XOx3blGVcUa+OvAE0q+wlwF+vVDKzogJx3+ZwTu+xgFnflXFcoBQAPDj3/5TSVbphGsB7Sb8ceyJrUzR6zyvlqSI+L8S9wNjYzed9iYiYFbDNxU4BXvSeJPVhq23Evh3Qvg9MdapVNCll/JmQu9JNzD8uz9Qfst+78H+6yxsOn7cNCMhKehXCuEB7MbYzae+oePcIVJxvuoqSFOACdj9m1m3J+yI/QekW7B/S5rW9e1vv+nIB9Co16nsP6eEPQNQO3WLkmyTAEc4xsOok1TmX/uGjnPHyISsWbNhBgqb8VColZIbAx7GfogYR7C3mpNx5S9/xO8eLrDf29OQpl0JabMQEpWtUImoCC5mdlgImW1vY0dDU6hhYo0YayLUC0loltaORKJ81mlvXHrMNhGCoCypg8mUwSXQu13y8L4903+/6MQfeOSmk3ddFex//Ve4+WaQ9gROAcq0G3DNPuuwf0GSPE6j0dSVV27xmL521y3YVqGSFNMGPTj0Az1CXYaSIAWa0W4GKcWOmeQWOIqsPiqxnSh70ItIUTCGXMUMhagh0xhLC80YYvD5x5241ea08tFrkVSM0fOAt9NJ4azBchBaacKPk8ji0a4G/OCTu7ANmHnAfcBJSLPamLANW3FXIP0M+2mkLXI0vnLXLRipQCgGe0AKEy36s3lSDVwVYcghVEPqumMaR2M9nVLp9V8siV5eST335A9z3c8foHe0qaeT9XI9DYWQJC4kiQgVEXuNe4W6gGKrY8La6Lg2FIrDNBzPP/74LXdSTr6JwZXLqEyYeJTtD7ScDHfEjSxa84zwbYbB2i2n78IE/NKX4IUXoK/vSOwPAmEcW3BDRmMx0j0MDi6mr8+bo3K/dOXNTDxkgLGVtVAJaS/yVMFkjDHDhGQ1bg4HUxsJjfS/bqGUuuTeH2KaKnigiNRlxwHMRKCCqNqsjFGrL5p7fP3i+27iomM2//fKJ1wDMA30cdtT1aFj14oSGvRrl0o/J8ZG/YaTduE4YFZy1UWMxyIdvFEszy3DpmWmSMAi4G56e19icJDNUbtfv+8ujEJwOiGm3i2TwK7KrDBe11cbrDWSss+e98bYak9ffSPfm9nLtEZMkhB7DFNtJmd9E1iO44qX7ps3ttsxd3P+cZ2nyXpOvI7+SlFrqvVDDUcDlU4rbFqSswa6qzYcHp0xtcGy687YNQn4MgntXuAo4GDs3lY2gxYZR4E/Iv0b9ipC6Lho4PKf/phCURobjn1OktlC/cLrbF5qNr1eSSGOPfk7vnThP2yz+/4fl9zBwLtq1FYWyiHRFKwZiAAsc2wuLyipnzf3Ix1ft2vBNVgqWByBea/tUqc7+WyCxArgJtnLx249fecn4KsaqVivJmG5XGBsbCb2XkiTW9sj1yEtQnoRqCOhyy7rTAXeeTtJoBLtWRJTsNfbWuJmHIpS/MJH5m3XB/CyO+6nmiyi0hgouqCpKNkdE8EvpLW4WkHxgnmdjbGy4FpkF2LQUcC7sQsdhrrU6tXw20IxuQuoV3948s5HQPMpwEWydNtewMCGQAxoIbAc0lRcs7FKFnbAhkIhUq1a3/tex7998Z03E+1QCuXJiD2xU+MXk8RrQPFzx2xf4r0a37jrNqr9e9M99EI5EnfHnm60hmZ8gaJHqYkL5rc/5uIJ1yNUEun7DYcre6A7rDGkjrhDTT/moqhvhUyJtg3xTgMqQHMgU61+G9ANJK1dDCloCPwo8BCEYWggtjwIeuk9PyId7SMU6yUlyeyAp8boZSFJl047fKy+9BfdXPTR+TtsQPnS+27PPHOFfjebe2OKiOdK3c01sSF/9gML2ifhR69FokeRuYa3qcMtDTYBsUTyDRHWDVdOo3yddmwCmk8AXYD7QXOBA15ZRbSxUpaBR4H7gKq4aot++59/dg9Pr1nBHhMm9jaj98UqIp5rjMa1CP/9gnnsDLj8pz9huCoqJRchzDZMl7ykGJIlxulnj24/bFNacC0hMMVmPni2LbfbXqSVzbOkB8oJDzRSx+oWVs5sAwKeAxQCrP9r8LtanoTHGU8Efgp9D8Gwxebta730x7ei51fK+88YCNIc7KrhuViMoxd+cD47Iy6581Zsh0IoTEXay2JtquLCQGxccMzctq7R9+FrqJZF0ewbzTxMf0f9bTIpuBbpBpLm0tpTb4dHDtvsewpvLPkuJdvTPbQb8I7W73l838QJ+B2wvndzK7G+ededlMsTFPafOUXSWwxrEpI/FgrFnZZ8ABd+aAHJGHH9ce9a7ugnFekPaeMtrtfKF9/547auMXT76SgUqHV1L0T6D4nmRntj2gvMwETbh5nuQmnOU1t0T29wMcLjtAh1CDCBthglkzX/mbY5BLz0nhupFV5SjZFpFnNklo7V6wvrzbHmeUcfx86Oz594AsseWkhXsz5IGv8gXAxJckDJSeVrd97W1jWaN5xEabQaJT8CPNGqTW2PhJLJav4PUFrbXW7uyAQUEHYHH5BFkds2eEtAT+eS72p6Rm9QoTllmmCfNKYvNseGXywQ44Uf+Si7Cq448p2c9ZGPUm02q81mfNJIMdH+qUL5knvvbOsatZtPg8go8CBojTswx5Tt++zDHKpEhfKJ1+14BMxCLiTAwaD+Ds3NSLZxqCMk9FOtnDEJhX2AxWuXLl7SSO0vzPsYuxok8eCdP2bK9JmjRP5onBTk/SpKit+67+721igRnlJeZvg1HaliOWucyH4x9W62d0QJaFpqdD866lRlAVXQ2nZJ+9377+Grt91KDIV+YA7mpcZodcnAlOn+x4+dwq6Ku79/Pcufe4qenspoEv0UUGmkjb0VYnLFz+/a5Pn1G0+F1WOWeEywcENBYAfolTkoSUkqC67dcQhozgSKAt4KmtCZLSdAL0C6Kqt4Gh//ePVNDDdMUiyXU5hjGHQjfbEQivGiBR9jV8cXTz6dkcEhXCqMOPppYFK9EWdOeuBZfevGGzcdG1SRJrEq6ddZ6KsjWxBgfyeabO1QEtBA2k/WHjd0YPsJXAUeATey+OH46JpUYmisnuB0bxtH4kKVla6mwpsFF8w/AS9dTzqlPIj9PPbspUfsPZCkdf7ng78a99yRm05CxUCaxIXgpyzaDsq0ODcQYf/CmvXorDt2KBW8FzCFjsSfBTwNXpT17fnncY+++PbbOKCvRm+i6VIcUGw+i5q1zx87n3+aP5c3E87/5EmUVoyQNGorkFZacZ+Rnr5ycc3KTZOgLpSqYYXfgIZflZofVwo6S5Pu35gysae4emj7E9CcAcRiS/oVO+CfQFVQS/pterdAUhAvjlZ6SJiNtXg0OWR9Oa7lzYrPffgE0lIhQvoC2Eo0G5V16V3je8b1W07NiveDFmcCQJ0oVAtmBsfdFdMdQQIKCJOB2Zn0UwfOhxeCF2evKfjuuEd/467bCZEQYE9BlUL6Upce5by5n+bNjPOPW4AV6sDzQUyV6hPVRjV+/cZTUTNtCh5DjLpNKdhq2V+O9v6VhtQ979rtTUAgq3Tp7ewhUh14PFMIV4979PV//w+k3V1ITDb0x9SLnBbS84+ZTw6IpRK1Kf1rDask76FiKHztnk0HqRUCyqTg8/rTfptNL17mjOwxWmZCs7gdJaA5HYgl8IZeze2qXgEvZd7vpgXminf/Z0J1pBjFLOMV6/rXDMXQyJnXwoXvP5bKqmEreglWKTY9zdFcdvf94543dvOpxOga8IRRg7ZDMjIwWTHO7PSdAVtZAgoIE4GZHcb+IvgpaAzzigZQf44Hn3iGWowQkimGoiMvTRye7IuOOSFn3itWIjAaRqrAsoBnBrtkjbQXh0jC84LVbduCWQ/DAmjv42bso70+fuv2JKBmdKZ+geytP89knu/4Fc4PP/sEZRWLRM+Uvbz+1t1HQ72ZM+5V+Lu5H6LsXgwrgGBpajuJjlIBZk6Jg4jnslfVtR3hEzDz3peeryxrjG57Ambqt6lW+CXphLGgJaDV7QxHwUR5kkUxMSu6n1jC383Ppd/r2XQFj44BK6QwPQ1p8dJ7fzK+JPjRaSxbjoWfAWqd1GnZ9ERiT+xAD29FCVgASj2g6S+PqD2kwPMQ65s68OL7bqWeNAJiOmb1msXrxhp2zrTXweeP/RBWEZyuNC666QmFpA3ZIAFaBqyi3cxIVmOc7VjsIIqzFQkYgTgBPNBB6AWyXW6LstFvovg0DSTNpFe4G3tF/+4DvvD4eTnTxluVWCStlkdxWBcUpq1dsVZf3kSKrlBM6ZvWHAG/2HaploSyHH61k8KTrULAVuULZJmP7g6UxIZOVuvaPTwomSJU7YpxuMsxZ9im9FKhQNLTtMRKSX19fQNdvZXx05QjPzyD9csTC54TGmuniDOTJlpUP/Lkal2l7SEBpcwBabuR+Ibm70vhzOqmqq++ct+dOISC7YnA6vWhFNOScoZtAucdeyxJbBBifSjrFBsHypUS/3TzD8cnhkRBPA88pQ1tOl43BmMZVoEeLf3HdebmE7c1AQtACGT9/Top724Ay+B/j7sDzl/8MqU0pdiMPRIFYhgsY87dwbZS7qhoUKBncl/DaF0ImpSsG9LeHn/p05tOpTHarIF/afFs9npvh1YbvFd+YK2k+2u3nLK8f0JnAZCtRMAmELvZVBDvz63WMdCKTXH26391MKIAot92PSkXq5UJ/Tmz2sRIPTK8bhTwOlD3aKVUeqk0vhquS6QDgTBYXEXwHcBDSGstNS1hKVqqIj0p8ZNKOT7Z+/FrWfX9+duDgNAiXzcdhM+BIdD6TVI1ilptVNEMIAbTkMTq4OqcWW3ivy2YT4pwCCMWONAb23CGm9d/kjh9FKXFNUr8U8QPkG4H3QPcBfzIhdIte5TLz8dmMQ7f0PlG9a3ZoLIHqLSvgQV4DcTGps4p9zYpxlBsjtEls6xZH2F6Pbf/OpIOdRHtsWqRugrqicPp6m8+cCefe8+Hxj2vdv2ZG4fLlrc+r8DTWzCuLZaA5pMb/uoh20zU7pnKyu4/0NjUMGrDCY2qurKYNaMFw+k7yabyHQV/+5HjqfZ1W8Rhmd5Kr+Rqut3HtRUkYCCLV05uNXJsKwzeOs5D8HOPd8p/XzMCD96Lk0JFODrEsR39FaQ7KkJtDAeGBbOajRgc3TED/X5gKmLFK6plzDTMSqz7t4sKnh6g2d3hSQ1gOGPjNa970IQH76Ve6aXQGOsC1RsT90qXHH5IzqbNQIxNBGMOLqShUER0REC/DzBdrGQfYF9gUutfa1jJs5jn/D5G9YttSkADqWhnA8crPeAmUN3kpClQHlyltKu3DBpj5AV/U4fmbNqclUqUPfhWiighj7V13nuBIpAyHXgf2UsUiy8rIrEPWeeLpxG/8AdYTgP0y23mBVuZA9IutCF2s+kJUCBWeoRUio61SlrKmbSZSIIIQU1ElF1qJ2Hqo1piKmUSMBc4EFMAImp9ILa+OxCYi5mEwAu2CQHdIqA7YcYGW7G2ab0haEpEigQasZnmTNpMqAaqkbZea1hoK2DRAyQkiCOAPVs5Eb/Gim74fk/MEVRIGNkmBNxgiyrp8MS2uh9EImlIsZzINK3cAdlsCQgUUSR7s2bSli8XgZQBYD9ezvmOb1sB+9FgoB0L8/8D2yrtZDdhawMAAAAASUVORK5CYII=';
const FL_LOGO_BASE64 = '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';

/**
 * Portal do Ecossistema — avisos de inscrição.
 * WEBHOOK_SECRET permanece exclusivamente nas propriedades do Apps Script.
 * As duas constantes de imagens são incorporadas antes deste arquivo.
 */
const SITE_ORIGIN = 'https://portalecossistema.fundacaolemann.codebit.biz';
const SITE_URL = SITE_ORIGIN + '/imersoes';
const SENDER_NAME = 'Portal do Ecossistema';

function doGet() {
  return jsonResponse_({ok: true, service: 'Portal do Ecossistema'});
}

function autorizarGmail() {
  return GmailApp.getAliases();
}

function doPost(e) {
  try {
    const expectedSecret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
    if (!expectedSecret) throw new Error('A propriedade WEBHOOK_SECRET não foi configurada.');
    if (!e || !e.postData || !e.postData.contents) throw new Error('Requisição sem conteúdo.');
    const data = JSON.parse(e.postData.contents);
    if (!data || !data.secret || data.secret !== expectedSecret) throw new Error('Acesso não autorizado.');
    validatePayload_(data);
    sendRegistrationEmail_(data);
    return jsonResponse_({ok: true});
  } catch (error) {
    console.error(error);
    return jsonResponse_({ok: false, error: error instanceof Error ? error.message : 'Erro inesperado.'});
  }
}

function isParticipantConfirmation_(data) {
  return data.notificationType === 'participant_confirmation';
}

function sendRegistrationEmail_(data) {
  if (MailApp.getRemainingDailyQuota() < 1) throw new Error('O limite diário de envios de e-mail foi atingido.');
  const message = registrationMessage_(data);
  const images = loadInlineImages_();
  GmailApp.sendEmail(message.to, message.subject, message.body, {
    replyTo: message.replyTo,
    htmlBody: buildHtml_(data, images.hasLogo, images.hasCircle),
    name: SENDER_NAME,
    inlineImages: images.inlineImages,
  });
}

function registrationMessage_(data) {
  const participant = isParticipantConfirmation_(data);
  return {
    to: String(participant ? (data.recipientEmail || data.contactEmail) : data.contactEmail).trim(),
    replyTo: String(participant ? data.replyToEmail : data.participantEmail).trim(),
    subject: (participant ? 'Inscrição recebida: ' : 'Nova inscrição: ') + cleanSubject_(data.eventTitle) + ' | Portal do Ecossistema',
    body: buildPlainText_(data),
  };
}

function loadInlineImages_() {
  const inlineImages = {};
  let hasLogo = false;
  let hasCircle = false;
  try {
    inlineImages.flLogo = Utilities.newBlob(Utilities.base64Decode(FL_LOGO_BASE64), 'image/png');
    hasLogo = true;
  } catch (error) { console.warn('Falha ao carregar a logo; o e-mail será enviado sem ela.', error); }
  try {
    inlineImages.ecosystemCircle = Utilities.newBlob(Utilities.base64Decode(ECOSYSTEM_CIRCLE_BASE64), 'image/png');
    hasCircle = true;
  } catch (error) { console.warn('Falha ao carregar o grafismo; o e-mail será enviado sem ele.', error); }
  return {inlineImages: inlineImages, hasLogo: hasLogo, hasCircle: hasCircle};
}

function buildHtml_(data, hasLogo, hasCircle) {
  const participant = isParticipantConfirmation_(data);
  const greeting = escapeHtml_(firstName_(participant ? data.participantName : data.contactName));
  const title = participant ? 'Sua inscrição foi recebida' : 'Nova inscrição recebida';
  const intro = participant
    ? 'Recebemos sua inscrição na agenda abaixo.'
    : 'Uma pessoa se inscreveu em uma agenda da sua organização.';
  const buttonLabel = participant ? 'Acessar o portal' : 'Consultar inscrições no portal';
  const replyHint = participant
    ? 'Se tiver dúvidas, responda a este e-mail para falar com a organização anfitriã.'
    : 'Para entrar em contato com <strong>' + escapeHtml_(data.participantName) + '</strong>, responda a este e-mail. Sua resposta será enviada diretamente para <strong>' + escapeHtml_(data.participantEmail) + '</strong>.';
  const eventOrganization = data.eventOrganization
    ? '<p style="margin:8px 0 0;font-size:14px;line-height:1.5;"><strong>Organização anfitriã:</strong> ' + escapeHtml_(data.eventOrganization) + '</p>'
    : '';
  return `<!doctype html>
<html lang="pt-BR"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>@media only screen and (max-width:480px){.outer{padding:16px 8px!important}.section{padding:24px 20px!important}.email-header{padding:24px 20px 0!important}.email-title{font-size:26px!important}.orbit-cell{width:70px!important}.orbit-image{width:64px!important;height:auto!important}.brand-name{font-size:12px!important}.brand-section{font-size:11px!important}.row-label,.row-value{padding:12px 10px!important;font-size:13px!important}}</style>
</head>
<body style="margin:0;padding:0;background:#F1F4EE;font-family:Helvetica,Arial,sans-serif;color:#052B47;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;opacity:0;color:transparent;">${title}: ${escapeHtml_(data.eventTitle)}.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;table-layout:fixed;background:#F1F4EE;">
<tr><td class="outer" align="center" style="padding:32px 16px;">
<!--[if mso]><table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;table-layout:fixed;background:#FFFFFF;border:1px solid #D8E0DC;border-radius:22px;overflow:hidden;">
<tr><td class="email-header" style="padding:28px 32px 0;background:#052B47;border-bottom:5px solid #B2C530;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;table-layout:fixed;">
<tr><td width="112" valign="middle">${hasLogo ? '<img src="cid:flLogo" width="112" alt="Fundação Lemann" style="display:block;width:112px;max-width:100%;height:auto;border:0;">' : '<strong style="font-size:18px;color:#FFFFFF;">Fundação Lemann</strong>'}</td>
<td align="right" valign="middle" style="padding-left:12px;text-align:right;">
<p class="brand-name" style="margin:0;color:#FFFFFF;font-size:16px;line-height:1.35;font-weight:700;white-space:nowrap;">Portal do Ecossistema</p>
<p class="brand-section" style="margin:5px 0 0;color:#B2C530;font-size:12px;line-height:1.4;">Imersões em Eventos</p>
</td></tr>
</table>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;table-layout:fixed;margin-top:24px;">
<tr><td valign="bottom" style="padding:0 12px 28px 0;">
<h1 class="email-title" style="margin:0;color:#FFFFFF;font-size:30px;line-height:1.2;overflow-wrap:break-word;">${title}</h1>
</td><td class="orbit-cell" width="160" align="right" valign="bottom">${hasCircle ? '<img class="orbit-image" src="cid:ecosystemCircle" width="160" height="96" alt="" role="presentation" style="display:block;width:160px;height:96px;border:0;">' : ''}</td></tr>
</table>
</td></tr>
<tr><td class="section" style="padding:30px 32px;overflow-wrap:anywhere;word-break:break-word;">
<p style="margin:0 0 24px;font-size:16px;line-height:1.6;">Olá, ${greeting}. ${intro}</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;table-layout:fixed;margin-bottom:26px;background:#F4F7EE;border:1px solid #DCE4D4;border-radius:16px;">
<tr><td style="padding:20px;overflow-wrap:anywhere;word-break:break-word;">
<h2 style="margin:0 0 16px;font-size:21px;line-height:1.35;">${escapeHtml_(data.eventTitle)}</h2>
<p style="margin:0 0 8px;font-size:14px;line-height:1.5;"><strong>Data e horário:</strong> ${escapeHtml_(data.eventDate)}</p>
<p style="margin:0;font-size:14px;line-height:1.5;"><strong>Local:</strong> ${escapeHtml_(data.eventLocation)}</p>
${eventOrganization}
</td></tr></table>
<h2 style="margin:0 0 14px;font-size:19px;line-height:1.4;">${participant ? 'Sua inscrição' : 'Dados da pessoa inscrita'}</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;table-layout:fixed;margin-bottom:26px;border:1px solid #D7E0E5;border-radius:14px;overflow:hidden;">
${detailRow_('Nome', escapeHtml_(data.participantName), false)}
${detailRow_('E-mail', escapeHtml_(data.participantEmail), true)}
${detailRow_('Organização', escapeHtml_(data.participantOrganization), true)}
${detailRow_('Cargo ou função', escapeHtml_(data.participantRole), true)}
</table>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:100%;"><tr><td align="center" style="background:#007F68;border-radius:24px;">
<a href="${SITE_URL}" style="display:inline-block;padding:14px 22px;color:#FFFFFF;font-size:14px;line-height:1.4;font-weight:700;text-decoration:none;">${buttonLabel}</a>
</td></tr></table>
<p style="margin:24px 0 0;color:#526979;font-size:13px;line-height:1.6;">${replyHint}</p>
</td></tr>
<tr><td class="section" style="padding:22px 32px;background:#E8F3EF;color:#315469;font-size:12px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;table-layout:fixed;"><tr>
<td width="50%" valign="top" style="padding-right:12px;">Desenvolvimento de Ecossistema<br><strong>Fundação Lemann</strong></td>
<td class="footer-links" width="50%" align="right" valign="top" style="text-align:right;">
<p style="margin:0;"><a href="${SITE_ORIGIN}/termos-de-uso" style="color:#052B47;text-decoration:underline;">Termos de Uso</a></p>
<p style="margin:6px 0 0;"><a href="${SITE_ORIGIN}/privacidade" style="color:#052B47;text-decoration:underline;">Aviso de Privacidade</a></p>
</td></tr></table>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
}

function detailRow_(label, value, withTopBorder) {
  const border = withTopBorder ? 'border-top:1px solid #E3E9EC;' : '';
  return '<tr><td class="row-label" width="32%" valign="top" style="' + border + 'padding:13px 16px;background:#F7F9FA;color:#526979;font-size:13px;line-height:1.5;font-weight:700;overflow-wrap:anywhere;word-break:break-word;">' + label + '</td>'
    + '<td class="row-value" valign="top" style="' + border + 'padding:13px 16px;font-size:14px;line-height:1.5;overflow-wrap:anywhere;word-break:break-word;">' + (value || '—') + '</td></tr>';
}

function buildPlainText_(data) {
  const participant = isParticipantConfirmation_(data);
  const lines = [
    participant ? 'Sua inscrição foi recebida' : 'Nova inscrição recebida',
    '',
    'Olá, ' + firstName_(participant ? data.participantName : data.contactName) + '.',
    participant ? 'Recebemos sua inscrição na agenda abaixo.' : 'Uma pessoa se inscreveu em uma agenda da sua organização.',
    '',
    'Agenda: ' + data.eventTitle,
    'Data e horário: ' + data.eventDate,
    'Local: ' + data.eventLocation,
  ];
  if (data.eventOrganization) lines.push('Organização anfitriã: ' + data.eventOrganization);
  return lines.concat([
    '', participant ? 'Sua inscrição:' : 'Dados da pessoa inscrita:',
    'Nome: ' + data.participantName,
    'E-mail: ' + data.participantEmail,
    'Organização: ' + data.participantOrganization,
    'Cargo ou função: ' + data.participantRole,
    '', (participant ? 'Acessar o portal: ' : 'Consultar inscrições no portal: ') + SITE_URL,
    '', participant ? 'Se tiver dúvidas, responda a este e-mail para falar com a organização anfitriã.' : 'Para entrar em contato com ' + data.participantName + ', responda a este e-mail. Sua resposta será enviada diretamente para ' + data.participantEmail + '.',
    '', 'Portal do Ecossistema · Imersões em Eventos',
    'Desenvolvimento de Ecossistema · Fundação Lemann',
    'Termos de Uso: ' + SITE_ORIGIN + '/termos-de-uso',
    'Aviso de Privacidade: ' + SITE_ORIGIN + '/privacidade',
  ]).join('\n');
}

function validatePayload_(data) {
  ['contactName','contactEmail','eventFormat','eventTitle','eventDate','eventLocation','participantName','participantEmail','participantOrganization','participantRole'].forEach(function (field) {
    if (typeof data[field] !== 'string' || !data[field].trim()) throw new Error('Campo obrigatório ausente: ' + field + '.');
  });
  if (!isValidEmail_(data.contactEmail) || !isValidEmail_(data.participantEmail)) throw new Error('Um dos endereços de e-mail é inválido.');
  if (data.notificationType && data.notificationType !== 'host_notification' && data.notificationType !== 'participant_confirmation') throw new Error('Tipo de notificação inválido.');
  if (isParticipantConfirmation_(data)) {
    if (!isValidEmail_(data.replyToEmail)) throw new Error('O e-mail de resposta da organização anfitriã é inválido.');
    const recipient = data.recipientEmail || data.contactEmail;
    if (!isValidEmail_(recipient) || recipient.trim().toLowerCase() !== data.participantEmail.trim().toLowerCase() || data.contactEmail.trim().toLowerCase() !== data.participantEmail.trim().toLowerCase()) throw new Error('O destinatário deve ser a pessoa inscrita.');
  }
}

function isValidEmail_(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) && !/[\r\n,;]/.test(value);
}

function cleanSubject_(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 110);
}

function firstName_(value) {
  const name = String(value || '').trim();
  return name ? name.split(/\s+/)[0] : 'pessoa participante';
}

function escapeHtml_(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
