/**
 * View name type. Intentionally `string` (not a closed union) so that
 * each plugin can introduce its own views without touching core. Each
 * plugin's NavBar / view router locally narrows to its own union for
 * typo safety; the shared router accepts any string.
 *
 * Was a closed union ('templates'|'builder'|'saved'|'companies'|...)
 * which forced every new view in any plugin to require a core PR and
 * leaked the LinkedIn-specific 'companies' view into the shared base.
 */
export type View = string;

class RouterStore {
  view = $state<View>('templates');

  go(v: View): void {
    this.view = v;
  }
}

export const router = new RouterStore();
