import { Diagnostic, TextDocumentEdit } from "vscode-languageserver-types";
import { Methods } from "./types/methods";
import { getClient } from "./utils";

enum SourceActions {
  SourceAddMissingImportsTs = "source.addMissingImports.ts",
  SourceFixAllTs = "source.fixAll.ts",
  SourceRemoveUnusedTs = "source.removeUnused.ts",
  SourceOrganizeImportsTs = "source.organizeImports.ts",
}

interface SourceActionParams extends NvimLsp.RangeParams {
  context: {
    only: SourceActions[];
    diagnostics: Diagnostic[];
  };
}

interface Result {
  edit: {
    documentChanges: TextDocumentEdit[];
  };
}

interface Opts {
  sync?: boolean;
}

const makeCommand = (sourceAction: SourceActions) => (opts?: Opts) => {
  const bufnr = vim.api.nvim_get_current_buf();
  const client = getClient(bufnr);
  if (!client) {
    return;
  }

  const params = {
    ...vim.lsp.util.make_range_params(),
    context: {
      only: [sourceAction],
      diagnostics: vim.diagnostic.get(bufnr),
    },
  };

  const applyEdits = function (res: Result[]) {
    if (!res?.[0]?.edit?.documentChanges?.[0].edits) {
      return;
    }

    vim.lsp.util.apply_text_edits(
      res[0].edit.documentChanges[0].edits,
      bufnr,
      client.offset_encoding
    );
  };

  if (opts?.sync) {
    const res = client.request_sync<Result, SourceActionParams>(
      Methods.CODE_ACTION,
      params,
      undefined,
      bufnr
    );
    applyEdits(res.result);
  } else {
    client.request<Result, SourceActionParams>(
      Methods.CODE_ACTION,
      params,
      (_, res) => applyEdits(res),
      bufnr
    );
  }
};

export const addMissingImports = makeCommand(
  SourceActions.SourceAddMissingImportsTs
);
export const organizeImports = makeCommand(
  SourceActions.SourceOrganizeImportsTs
);
export const fixAll = makeCommand(SourceActions.SourceFixAllTs);
export const removeUnused = makeCommand(SourceActions.SourceRemoveUnusedTs);
